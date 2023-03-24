/**
 * KOA router module for managing resources related to issues resources with HTTP methods.
 * 
 * @module issueRoutes
 * @author Harman Singh
 * @requires koa,koa-bodyparser
 * @requires permissions/issues
 * @requires models/{issues, issuesViews, issueCatergories, commets, likes} 
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const auth = require('../controllers/authMiddleware');
const can = require('../permissions/issues');
const issues = require('../models/issues');
const issueViews = require('../models/issueViews');
const issueCategories = require('../models/issueCategories');
const comments = require('../models/comments');
const likes = require('../models/likes');

// validation schema
const {validateissue, validateComment} = require('../controllers/validation'); 

// URI endpoint to view the issues stored on db
const Prefix = '/api/v1/issues'; 
const router = Router({prefix: Prefix});

// issue routes
router.get('/', getAll);
router.post('/', auth, bodyParser(), validateissue, createissue); // posting data
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', auth, bodyParser(), validateissue, updateissue);
router.del('/:id([0-9]{1,})', auth, deleteissue); // validateissue = middleware

// likes routes
router.get('/:id([0-9]{1,})/likes', likesCount);
router.post('/:id([0-9]{1,})/likes', auth, likePost);
router.del('/:id([0-9]{1,})/likes', auth, dislikePost);

// views route
router.get('/:id([0-9]{1,})/views', getViewCount);

// categories routes
router.get('/:id([0-9]{1,})/categories', getAllCategories);
router.post('/:id([0-9]{1,})/categories/:cid([0-9]{1,})', auth, addCategory);
router.del('/:id([0-9]{1,})/categories/:cid([0-9]{1,})', auth, removeCategory);

// comments routes
router.get('/:id([0-9]{1,})/comments', getAllComments);
router.post('/:id([0-9]{1,})/comments', auth, bodyParser(), addCommentIds, validateComment, addComment);

/**
 * Get all articles with pagination, ordering, and HATEOAS links.
 * @param {Object} ctx - Koa context object
 */
async function getAll(ctx) {
  let {page=1, limit=10, order='dateCreated', direction='DESC'} = ctx.request.query;

  // ensure params are integers
  limit = parseInt(limit);
  page = parseInt(page);
  
  // validate pagination values to ensure they are sensible
  limit = limit > 100 ? 100 : limit;
  limit = limit < 1 ? 10 : limit;
  page = page < 1 ? 1 : page;

  // ensure order and direction make sense
  order = ['dateCreated', 'dateModified'].includes(order) ? order : 'dateCreated';
  direction = ['ASC', 'DESC'].includes(direction) ? direction : 'ASC';

  const result = await issues.getAll(page, limit, order, direction);
  if (result.length) {
    const body = result.map(post => {
      // extract the post fields we want to send back (summary details)
      const {ID, title, summary, imageURL, authorID} = post;
      // add links to the post summaries for HATEOAS compliance
      // clients can follow these to find related resources
      const links = {
        likes: `${ctx.protocol}://${ctx.host}${prefix}/${post.ID}/likes`,
        self: `${ctx.protocol}://${ctx.host}${prefix}/${post.ID}`
      }
      return {ID, title, summary, imageURL, authorID, links};
    });
    ctx.body = body;
  }
}

/**
 * Get the number of likes for an article by its ID.
 * 
 * @param {object} ctx 
 * @returns 
 */
async function likesCount(ctx) {
  // TODO: add error handling
  const id = ctx.params.id;
  const result = await likes.count(id);
  ctx.body = result ? result : 0;
}

/**
 * Like an article by its ID for the current user.
 * @param {Object} ctx - Koa context object
 */
async function likePost(ctx) {
  // TODO: add error handling
  const id = parseInt(ctx.params.id);
  const uid = ctx.state.user.ID;
  const result = await likes.like(id, uid);
  console.log(result);
  ctx.body = result.affectedRows ? {message: "liked"} : {message: "error"};
}

/**
 * Dislike an article by its ID for the current user.
 * @param {Object} ctx - Koa context object
 */
async function dislikePost(ctx) {
  // TODO: remove error handling
  const id = parseInt(ctx.params.id);
  const uid = ctx.state.user.ID;
  const result = await likes.dislike(id, uid);
  console.log(result);
  ctx.body = result.affectedRows ? {message: "disliked"} : {message: "error"};
}

/**
 * Get an article by its ID.
 * @param {Object} ctx - Koa context object
 */
async function getById(ctx) {
  const id = ctx.params.id;
  const result = await issues.getById(id);
  if (result.length) {
    await issueViews.add(id);  // add a record of being viewed
    const issue = result[0];
    ctx.body = issue;
  }
}

/**
 * Create a new article.
 * @param {Object} ctx - Koa context object
 */
async function createissue(ctx) {
  const body = ctx.request.body; // bodyParser
  const result = await issues.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = {ID: id, created: true, link: `${ctx.request.path}/${id}`};
  }
}

/**
 * Update an existing article by its ID.
 * @param {Object} ctx - Koa context object
 */
async function updateissue(ctx) {
  const id = ctx.params.id;
  let result = await issues.getById(id);  // check it exists
  if (result.length) {
    let issue = result[0];
    const permission = can.update(ctx.state.user, issue);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      // exclude fields that should not be updated
      const {ID, dateCreated, dateModified, authorID, ...body} = ctx.request.body;
      // overwrite updatable fields with remaining body data
      Object.assign(issue, body);
      result = await issues.update(issue);
      if (result.affectedRows) {
        ctx.body = {ID: id, updated: true, link: ctx.request.path};
      }
    }
  }
}

/**
 * Delete an article by its ID.
 * @param {Object} ctx - Koa context object
 */
async function deleteissue(ctx) {
  const permission = can.delete(ctx.state.user);
  if (!permission.granted) {
    ctx.status = 403;
  } else {
    const id = ctx.params.id;
    const result = await issues.delById(id);
    if (result.affectedRows) {
      ctx.body = {ID: id, deleted: true}
    }
  }
}

/**
 * Get the view count of an article by its ID.
 * @param {Object} ctx - Koa context object
 */
async function getViewCount(ctx) {
  const id = ctx.params.id;
  const result = await issueViews.count(id);
  if (result.length) {
    ctx.body = {ID: id, views: result[0].views};
  }
}

/**
 * Add a category to an article.
 * @param {Object} ctx - Koa context object
 */
async function addCategory(ctx) {
  const issueID = ctx.params.id;
  const categoryID = ctx.params.cid;
  const result = await issueCategories.add(issueID, categoryID);
  if (result.affectedRows) {
    ctx.status = 201;
    ctx.body = {added: true};
  }
}

/**
 * Remove a category from an article.
 * @param {Object} ctx - Koa context object
 */
async function removeCategory(ctx) {
  const issueID = ctx.params.id;
  const categoryID = ctx.params.cid;
  const result = await issueCategories.delete(issueID, categoryID);
  if (result.affectedRows) {
    ctx.body = {deleted: true};
  }
}

/**
 * Get all categories for an article by its ID.
 * @param {Object} ctx - Koa context object
 */
async function getAllCategories(ctx) {
  const id = ctx.params.id;
  const result = await issueCategories.getAll(id);
  if (result.length) {
    ctx.body = result;
  }
}

/**
 * Get all comments for an article by its ID.
 * @param {Object} ctx - Koa context object
 */
async function getAllComments(ctx) {
  const id = ctx.params.id;
  const result = await comments.getAll(id);
  if (result.length) {
    ctx.body = result;
  }
}

/**
 * Add a comment to an article.
 * @param {Object} ctx - Koa context object
 */
async function addComment(ctx) {
  const comment = ctx.request.body;
  const result = await comments.add(comment);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = {ID: id, created: true};
  }
}

/**
 * Add comment IDs (article ID and user ID) to the request body.
 * @param {Object} ctx - Koa context object
 * @param {Function} next - Koa next middleware function
 */
function addCommentIds(ctx, next) {
  // every comment needs an issue ID and a user ID
  const id = parseInt(ctx.params.id);
  const uid = ctx.state.user.ID;
  Object.assign(ctx.request.body, {issueID: id, authorID: uid})
  return next();
}

module.exports = router;
