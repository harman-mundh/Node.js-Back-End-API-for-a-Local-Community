/**
 * KOA router module for managing resources related to announcements resources with CRUD methods.
 * 
 * @module announcements
 * @author Harman Singh
 * @requires koa,koa-bodyparser
 * @requires permissions/announcements
 * @requires models/{announcements, announcementsViews} 
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const auth = require('../controllers/authMiddleware');
const can = require('../permissions/announcements');
const announcements = require('../models/announcements');
const announcementsViews = require('../models/announcementsViews');

// validation schema
const {validateAnnoucement, validateAnnoucementUpdate} = require('../controllers/validationMiddleware');

const prefix_v2 = '/api/v2/announcements';
const router = Router({prefix: prefix_v2});

// announcements routes
router.get('/', getAll);
router.get('/:id([0-9]{1,})', auth, getById);
router.post('/', auth, bodyParser(), validateAnnoucement, createAnnouncement);
router.put('/:id([0-9]{1,})', auth, bodyParser(), validateAnnoucementUpdate, updateAnnouncement);
router.del('/:id([0-9]{1,})', auth, deleteAnnouncement);

// views counts
router.get('/announcements/:id([0-9]{1,})/views', getViewCount);

/**
 * Get all Announcements with pagination, ordering, and HATEOAS links.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not Found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Response} JSON - Http respons containing HATEOAS links and message
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

  const result = await announcements.getAll(page, limit, order, direction);
  if (result.length) {
    const body = result.map(post => {
      // extract the post fields we want to send back (summary details)
      const {ID, title, allText, dateCreated, authorID} = post;

      const links = {
        views: `${ctx.protocol}://${ctx.host}${prefix_v2}/${post.ID}/views`,
        self: `${ctx.protocol}://${ctx.host}${prefix_v2}/${post.ID}`
      }
      
      return {ID, title, allText, dateCreated, authorID, links};
    });
    ctx.body = body;
  }
}

/**
 * Get a Announcement Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not Found
 * @throws {Object} 500 - Internal Server Error
* @returns {Object} 200 - Success response
 * @returns {Object} JSON - Announcement post body with attributes
 */
async function getById(ctx) {
  try {
    const id = ctx.params.id;
    const result = await announcements.getById(id);
    if (result.length) {
      await announcementsViews.add(id);  // add a record of being viewed
      const announcement = result[0];

      const links = {
        goBack: `${ctx.protocol}://${ctx.host}${prefix_v2}`,
        self: `${ctx.protocol}://${ctx.host}${prefix_v2}/${announcement.ID}`
      }

      ctx.body = {
        announcement: announcement,
        links: links
      };

    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Announcement not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to retrive the post. Details: ${error.message}` };
  }
}

/**
 * Create a new Announcement Post.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 400 - Bad Request
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 200 - Success response
 */
async function createAnnouncement(ctx) {
  try {
    const body = ctx.request.body;
    const permission = can.create(ctx.state.user);

    if (!permission.granted) {
      ctx.status = 403;
      ctx.body = {error: "You don't have permission to create on annoucements"};
      return;
    }

    const result = await announcements.add(body);
    if (result.affectedRows) {
      const id = result.insertId;
      ctx.status = 201;
      ctx.body = {ID: id, created: true, link: `${ctx.request.path}/${id}`};
    } else {
      ctx.status = 400;
      ctx.body = { error: `Error: ${ctx.status} Announcement post failed to create.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to create the annoucement post. Details: ${error.message}` };
  }
}

/**
 * Update an existing Announcement Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 403 - Forbidden
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 200 - Success response
 */
async function updateAnnouncement(ctx) {
  try{
    const id = ctx.params.id;
    let result = await announcements.getById(id);  
    if (result.length) {
      let data = result[0];
      const permission = can.update(ctx.state.user, data);
      if (!permission.granted) {
        ctx.status = 403;
        ctx.body = {error: "You don't have permission to update on annoucements"};
      } else {
        const newData = permission.filter(ctx.request.body);
        Object.assign(newData, {ID: id}); 
        result = await announcements.update(newData);
        if (result.affectedRows) {
          ctx.body = {ID: id, updated: true, link: ctx.request.path};
        } else {
          ctx.status = 404;
          ctx.body = { error: `Error: ${ctx.status} Announcement not found.` };
        }
      }
    }
  } catch (error) {
      ctx.status = 500;
      ctx.body = {error: `Error: ${ctx.status} while trying to update the annoucement post. ${error.message}`};
  }
}

/**
 * Delete a Announcement Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 403 - Forbidden
 * @throws {Object} 404 - Not Found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 200 - Success response
 * @returns {number|boolean} JSON - ID and boolean value
 */
async function deleteAnnouncement(ctx) {
  try {
  const permission = can.delete(ctx.state.user);
    if (!permission.granted) {
      ctx.status = 403;
      ctx.body = {error: "You don't have permission to delete on annoucements"};
    } else {
      const id = ctx.params.id;
      const result = await announcements.delById(id);
      if (result.affectedRows) {
        ctx.body = {ID: id, deleted: true}
      } else {
        ctx.status = 404;
        ctx.body = { error: `Error: ${ctx.status} Announcement not found.` };
        }
      }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to delete the annoucement. Details: ${error.message}` };
  }
}
  
/**
 * Get the view count of an Announcement Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {number|number} JSON - ID and views count number
 */
async function getViewCount(ctx) {
  try {
    const id = ctx.params.id;
    const result = await announcementsViews.count(id);
    if (result.length) {
      ctx.body = {ID: id, views: result[0].views};
    } else {
    ctx.status = 404;
    ctx.body = { error: `Error: ${ctx.status} view count not found.` };
    }
  } catch (error){
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to view count of the post. Details: ${error.message}` };
  }
}

module.exports = router;