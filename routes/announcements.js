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
router.get('/:id([0-9]{1,})', getById);
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
  try {
    const { page = 1, limit = 10, order = 'dateCreated', direction = 'DESC' } = ctx.request.query;

    const issuesData = await announcements.getAll(page, limit, order, direction);
    ctx.body = issuesData;
    if (issuesData.length) {
      ctx.body = issuesData;
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} No issue posts were found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to retrieve all announcements posts from DB. Details: ${error.message}`};
  }
}

/**
 * Get a Announcement Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not Found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - Announcement post body with attributes
 */
async function getById(ctx) {
  try {
    const id = ctx.params.id;
    const result = await announcements.getById(id);
    if (result.length) {
      await announcementsViews.add(id);  // add a record of being viewed
      const announcement = result[0];
      ctx.body = announcement;
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Announcement not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to dislike the post. Details: ${error.message}` };
  }
}

/**
 * Create a new Announcement Post.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 400 - Bad Request
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 201 - Success response
 */
async function createAnnouncement(ctx) {
  try {
    const body = ctx.request.body; // bodyParser
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
    ctx.body = { error: `Error: ${ctx.status} while trying to dislike the post. Details: ${error.message}` };
  }
}

/**
 * Update an existing Announcement Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 403 - Forbidden
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 201 - Success response
 */
async function updateAnnouncement(ctx) {
  try {
    const id = ctx.params.id;
    let result = await announcements.getById(id);  // check it exists
    if (result.length) {
      let announcement = result[0];
      const permission = can.update(ctx.state.user, announcement);
      if (!permission.granted) {
        ctx.status = 403;
      } else {
        // exclude fields that should not be updated
        const {ID, dateCreated, dateModified, authorID, ...body} = ctx.request.body;
        // overwrite updatable fields with remaining body data
        Object.assign(announcement, body);
        result = await announcement.update(announcement);
        if (result.affectedRows) {
          ctx.body = {ID: id, updated: true, link: ctx.request.path};
        } else {
          ctx.status = 400;
          ctx.body = { error: `Error: ${ctx.status} Failed to update the update.` };
        }
      }
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Announcement not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to update the post. Details: ${error.message}` };
  }
}

/**
 * Delete a Announcement Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 403 - Forbidden
 * @throws {Object} 404 - Not Found
 * @throws {Object} 500 - Internal Server Error
 * @returns {number|boolean} JSON - ID and boolean value
 */
async function deleteAnnouncement(ctx) {
  try {
  const permission = can.delete(ctx.state.user);
    if (!permission.granted) {
      ctx.status = 403;
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
    ctx.body = { error: `Error: ${ctx.status} while trying to update the post. Details: ${error.message}` };
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
    ctx.body = { error: `Error: ${ctx.status} while trying to viwe count of the post. Details: ${error.message}` };
  }
}

module.exports = router;