/**
 * KOA router module for managing resources related to issues resources with CRUD methods.
 * 
 * @module issues
 * @author Harman Singh
 * @requires koa,koa-bodyparser
 * @requires permissions/issues
 * @requires models/{issues, issuesViews, issueCatergories, comments, likes} 
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

// resources related to creating and managing issues
const router = require('./routes/special.js')
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
// const router = Router({prefix: Prefix});

// issue routes
router.get('/issues', getAll);
router.post('/issues', auth, bodyParser(), validateissue, createissue); // posting data
router.get('/issues/:id([0-9]{1,})', getById);
router.put('/issues/:id([0-9]{1,})', auth, bodyParser(), validateissue, updateissue);
router.del('/issues/:id([0-9]{1,})', auth, deleteissue); // validateissue = middleware

// likes routes
router.get('/issues/:id([0-9]{1,})/likes', likesCount);
router.post('/issues/:id([0-9]{1,})/likes', auth, likePost);
router.del('/issues/:id([0-9]{1,})/likes', auth, dislikePost);

// views route
router.get('/issues/:id([0-9]{1,})/views', getViewCount);

// categories routes
router.get('/issues/:id([0-9]{1,})/categories', getAllCategories);
router.post('/issues/:id([0-9]{1,})/categories/:cid([0-9]{1,})', auth, addCategory);
router.del('/issues/:id([0-9]{1,})/categories/:cid([0-9]{1,})', auth, removeCategory);

// comments routes
router.get('/issues/:id([0-9]{1,})/comments', getAllComments);
router.post('/issues/:id([0-9]{1,})/comments', auth, bodyParser(), addCommentIds, validateComment, addComment);

/**
 * Get all issues with pagination, ordering, and HATEOAS links.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Response} JSON - Http respons containing HATEOAS links and message
 */
async function getAll(ctx) {
  try {
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
          likes: `${ctx.protocol}://${ctx.host}${Prefix}/${post.ID}/likes`,
          self: `${ctx.protocol}://${ctx.host}${Prefix}/${post.ID}`
        }
        return {ID, title, summary, imageURL, authorID, links};
      });
      ctx.body = body;
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} No issue posts were found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to retrive all issue posts from DB. Details: ${error.message}`};
  }
}

/**
 * Return the total number of likes for an issue post by its ID to the logged user.
 * 
 * @param {object} ctx 
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - Number of total likes
 */
async function likesCount(ctx) {
  try {
    const id = ctx.params.id;
    const result = await likes.count(id);

    if (result !== null) {
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Issue not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to get the likes count. Details: ${error.message}` };
  }
}

/**
 * Register like to the current issue post by logged user.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - Like status message
 */
async function likePost(ctx) {
  try {
    const id = parseInt(ctx.params.id);
    const uid = ctx.state.user.ID;
    const result = await likes.like(id, uid);
    
    if (result.affectedRows) {
      ctx.body = { message: "liked" };
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Issue not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to like the post. Details: ${error.message}` };
  }
}

/**
 * Register dislike to the current issue post by logged user.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - Dislike status message
 */
 async function dislikePost(ctx) {
  try {
    const id = parseInt(ctx.params.id);
    const uid = ctx.state.user.ID;
    const result = await likes.dislike(id, uid);

    if (result.affectedRows) {
      ctx.body = { message: "disliked" };
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Issue not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to dislike the post. Details: ${error.message}` };
  }
}

/**
 * Get a Issue Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - Issues post body with attributes
 */
async function getById(ctx) {
  try {
    const id = ctx.params.id;
    const result = await issues.getById(id);
    if (result.length) {
      await issueViews.add(id);  // add a record of being viewed
      const issue = result[0];
      ctx.body = issue;
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Issue not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to dislike the post. Details: ${error.message}` };
  }
}

/**
 * Create a new Issue Post.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 400 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 201 - Success response
 */
async function createissue(ctx) {
  try {
    const body = ctx.request.body; // bodyParser
    const result = await issues.add(body);
    if (result.affectedRows) {
      const id = result.insertId;
      ctx.status = 201;
      ctx.body = {ID: id, created: true, link: `${ctx.request.path}/${id}`};
    } else {
      ctx.status = 400;
      ctx.body = { error: `Error: ${ctx.status} Issues post failed to create.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to dislike the post. Details: ${error.message}` };
  }
}

/**
 * Update an existing Issue Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 403 - Forbidden
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 201 - Success response
 */
async function updateissue(ctx) {
  try {
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
        } else {
          ctx.status = 400;
          ctx.body = { error: `Error: ${ctx.status} Failed to update the update.` };
        }
      }
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Issue not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to update the post. Details: ${error.message}` };
  }
}

/**
 * Delete a Issue Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 403 - Forbidden
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - ID and boolean value
 */
async function deleteissue(ctx) {
  try {
  const permission = can.delete(ctx.state.user);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      const id = ctx.params.id;
      const result = await issues.delById(id);
      if (result.affectedRows) {
        ctx.body = {ID: id, deleted: true}
      } else {
        ctx.status = 404;
        ctx.body = { error: `Error: ${ctx.status} Issue not found.` };
        }
      }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to update the post. Details: ${error.message}` };
  }
}
  
/**
 * Get the view count of an Issue Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - ID and views count number
 */
async function getViewCount(ctx) {
  try {
    const id = ctx.params.id;
    const result = await issueViews.count(id);
    if (result.length) {
      ctx.body = {ID: id, views: result[0].views};
    } else {
    ctx.status = 404;
    ctx.body = { error: `Error: ${ctx.status} view count not found.` };
    }
  } catch (error){
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to viwe count of the post. Details: ${error.message}` };
  }
}

/**
 * Add a category to a Issue Post.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 400 - Bad Request
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 201 - Success: boolean True
 */
async function addCategory(ctx) {
  try {
    const issueID = ctx.params.id;
    const categoryID = ctx.params.cid;
    const result = await issueCategories.add(issueID, categoryID);
    if (result.affectedRows) {
      ctx.status = 201;
      ctx.body = {added: true};
    } else {
      ctx.status = 400;
      ctx.body = { error: `Error: ${ctx.status} failed to add category to issue post.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to add category to the post. Details: ${error.message}` };
  }
}

/**
 * Remove a category from a Issue Post.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - Delete: boolean value
 */
async function removeCategory(ctx) {
  try {
    const issueID = ctx.params.id;
    const categoryID = ctx.params.cid;
    const result = await issueCategories.delete(issueID, categoryID);
    if (result.affectedRows) {
      ctx.body = {deleted: true};
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} category not found.` };
      }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to remove category from post. Details: ${error.message}` };
  }
}

/**
 * Get all categories for a Issue Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - All categories related to the issue post
 */
async function getAllCategories(ctx) {
  try{
    const id = ctx.params.id;
    const result = await issueCategories.getAll(id);
    if (result.length) {
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} No categories were found for this issue post.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to retrive all categories for the post. Details: ${error.message}`};
  }
}

/**
 * Get all comments for a Issue Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - All categories related to the issue post
 */
async function getAllComments(ctx) {
  try{
    const id = ctx.params.id;
    const result = await comments.getAll(id);
    if (result.length) {
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} No comments were found for this issue post.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to retrive all commnets for the post. Details: ${error.message}`};
  }
}

/**
 * Add a comment to a Issue Post.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 400 - Bad Request
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 201 - Success: ID of comment and Create: True
 */
async function addComment(ctx) {
  try {
    const comment = ctx.request.body;
    const result = await comments.add(comment);
    if (result.affectedRows) {
      const id = result.insertId;
      ctx.status = 201;
      ctx.body = {ID: id, created: true};
      } else {
        ctx.status = 400;
        ctx.body = { error: `Error: ${ctx.status} failed to add comment to issue post.` };
      }
  } catch (error){
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to add comment to the post. Details: ${error.message}` };
  }
}

/**
 * Add the IssueID and userID to comment body before passing to addComment.
 * 
 * @param {Object} ctx - Koa context object
 * @returns {Function} next - Pass data to addComment
 */
function addCommentIds(ctx, next) {
  // every comment needs an issue ID and a user ID
  const id = parseInt(ctx.params.id);
  const uid = ctx.state.user.ID;
  Object.assign(ctx.request.body, {issueID: id, authorID: uid})
  return next();
}

module.exports = router;