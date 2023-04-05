/**
 * KOA router module for managing resources related to meetings resources with CRUD methods.
 * 
 * @module meetings
 * @author Harman Singh
 * @requires koa,koa-bodyparser
 * @requires permissions/meetings
 * @requires models/{meetings, meetingsViews} 
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const auth = require('../controllers/authMiddleware');
const can = require('../permissions/meetings');
const meetings = require('../models/mettings');
const meetingsViews = require('../models/mettingsViews');

// validation schema
const {validateMeetings, validateLocation} = require('../controllers/validationMiddleware');

const prefix_v2 = '/api/v2/meetings';
const router = Router({prefix: Prefix});

// meetings routes
router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);
router.post('/', auth, bodyParser(), validateMeetings, createMeeting);
router.put('/:id([0-9]{1,})', auth, bodyParser(), validateMeetings, updateMeeting);
router.del('/:id([0-9]{1,})', auth, deleteMeeting);

// views counts
router.get('/meetings/:id([0-9]{1,})/views', getViewCount);

/**
 * Get all meetings with pagination, ordering, and HATEOAS links.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not Found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Response} JSON - Http respons containing HATEOAS links and message
 */
async function getAll(ctx) {
  try {
    const {page=1, limit=10, order='dateCreated', direction='DESC'} = ctx.request.query;

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

    const result = await meetings.getAll(page, limit, order, direction);
    if (result.length) {
      const body = result.map(post => {
        // extract the post fields we want to send back (summary details)
        const {ID, title, allText, summary, start_time, end_time, authorID, dataCreated, locationID} = post;
        // add links to the post summaries for HATEOAS compliance
        // clients can follow these to find related resources
        const links = {
          goBack: `${ctx.protocol}://${ctx.host}${prefix_v2}/`,
          self: `${ctx.protocol}://${ctx.host}${prefix_v2}/${post.ID}`
        }
        return {ID, title,  allText, summary, start_time, end_time, authorID, dataCreated, links, getLocation(locationID)};
      });
      ctx.body = body;
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} No meeting posts were found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to retrive all meeting posts from DB. Details: ${error.message}`};
  }
}

/**
 * Get a Meeting Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not Found
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} JSON - Meetings post body with attributes
 */
async function getById(ctx) {
  try {
    const id = ctx.params.id;
    const result = await meetings.getById(id);
    if (result.length) {
      await meetingsViews.add(id);  // add a record of being viewed
      const meeting = result[0];
      ctx.body = meeting;
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Meeting not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to dislike the post. Details: ${error.message}` };
  }
}

/**
 * Create a new Meeting Post.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 400 - Bad Request
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 201 - Success response
 */
async function createMeeting(ctx) {
  try {
    const body = ctx.request.body; // bodyParser
    const result = await meetings.add(body);
    if (result.affectedRows) {
      const id = result.insertId;
      ctx.status = 201;
      ctx.body = {ID: id, created: true, link: `${ctx.request.path}/${id}`};
    } else {
      ctx.status = 400;
      ctx.body = { error: `Error: ${ctx.status} meetings post failed to create.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to dislike the post. Details: ${error.message}` };
  }
}

/**
 * Update an existing Meeting Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 403 - Forbidden
 * @throws {Object} 500 - Internal Server Error
 * @returns {Object} 201 - Success response
 */
async function updateMeeting(ctx) {
  try {
    const id = ctx.params.id;
    let result = await meetings.getById(id);  // check it exists
    if (result.length) {
      let meeting = result[0];
      const permission = can.update(ctx.state.user, meeting);
      if (!permission.granted) {
        ctx.status = 403;
      } else {
        // exclude fields that should not be updated
        const {ID, dateCreated, dateModified, authorID, ...body} = ctx.request.body;
        // overwrite updatable fields with remaining body data
        Object.assign(meeting, body);
        result = await meetings.update(meeting);
        if (result.affectedRows) {
          ctx.body = {ID: id, updated: true, link: ctx.request.path};
        } else {
          ctx.status = 400;
          ctx.body = { error: `Error: ${ctx.status} Failed to update the update.` };
        }
      }
    } else {
      ctx.status = 404;
      ctx.body = { error: `Error: ${ctx.status} Meeting not found.` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to update the post. Details: ${error.message}` };
  }
}

/**
 * Delete a Meeting Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 403 - Forbidden
 * @throws {Object} 404 - Not Found
 * @throws {Object} 500 - Internal Server Error
 * @returns {number|boolean} JSON - ID and boolean value
 */
async function deleteMeeting(ctx) {
  try {
  const permission = can.delete(ctx.state.user);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      const id = ctx.params.id;
      const result = await meetings.delById(id);
      if (result.affectedRows) {
        ctx.body = {ID: id, deleted: true}
      } else {
        ctx.status = 404;
        ctx.body = { error: `Error: ${ctx.status} Meeting not found.` };
        }
      }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error: ${ctx.status} while trying to update the post. Details: ${error.message}` };
  }
}
  
/**
 * Get the view count of an Meeting Post by its ID.
 * 
 * @param {Object} ctx - Koa context object
 * @throws {Object} 404 - Not found
 * @throws {Object} 500 - Internal Server Error
 * @returns {number|number} JSON - ID and views count number
 */
async function getViewCount(ctx) {
  try {
    const id = ctx.params.id;
    const result = await meetingsViews.count(id);
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