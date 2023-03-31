/**
 * KOA router module for managing resources related to issues resources with HTTP methods.
 * 
 * @module issueRoutes
 * @author Harman Singh
 * @requires koa,koa-bodyparser
 * @requires permissions/issues
 * @requires models/{issues, issuesViews, issueCatergories, comments, likes} 
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const etag = require('etag');
const model = require('../models/users');
const auth = require('../controllers/authMiddleware');
const can = require('../permissions/users');
const {validateUser, validateUserUpdate} = require('../controllers/validationMiddleware'); 

const prefix = '/api/v1/users'
const router = Router({prefix: prefix});

router.get('/', auth, getAll); // check permissions and require authentication 
router.post('/', bodyParser(), validateUser, createUser);
router.post('/login', auth, login);
router.get('/:id([0-9]{1,})', auth, getById);
router.put('/:id([0-9]{1,})', auth, bodyParser(), validateUserUpdate, updateUser);
router.del('/:id([0-9]{1,})', auth, deleteUser);
router.get('/search', auth, emailSearch);

/**
 * Search for users by email address.
 * 
 * @param {Object} ctx - Koa context object
 * @param {Function} next - Koa next middleware
 */
async function emailSearch(ctx, next) {
  // TODO: this implementation is basic
  // you could add pagination, partial response, etc.

  const permission = can.readAll(ctx.state.user);
  if (!permission.granted) {
    ctx.status = 403;
  } else {
    let {q} = ctx.request.query;
    
    if (q && q.length < 3) {
      ctx.status = 400;
      ctx.body = {message: "Search string length must be 3 or more."}
      return next();
    }

    let result = await model.emailSearch(q);
    if (result.length) {
      ctx.body = result;
    }    
  }
}

/**
 * Authenticate user and return login information.
 * 
 * @param {Object} ctx - Koa context object
 */
async function login(ctx) {
  // return any details needed by the client
  const {ID, username, email, avatarURL} = ctx.state.user
  const links = {
    self: `${ctx.protocol}://${ctx.host}${prefix}/${ID}`
  }
  ctx.body = {ID, username, email, avatarURL, links};
}

/**
 * Get all users with pagination and filtering by fields.
 * 
 * @param {Object} ctx - Koa context object
 */
async function getAll(ctx) {
  const permission = can.readAll(ctx.state.user);
  if (!permission.granted) {
    ctx.status = 403;
  } else {
    console.log(ctx.request.query);

    let {limit=10, page=1, fields=null} = ctx.request.query;

    // ensure params are integers
    limit = parseInt(limit);
    page = parseInt(page);
    
    // validate pagination values to ensure they are sensible
    limit = limit > 100 ? 100 : limit;
    limit = limit < 1 ? 10 : limit;
    page = page < 1 ? 1 : page;    

    let result = await model.getAll(limit, page);
    if (result.length) {
      if (fields !== null) {
        // first ensure the fields are contained in an array
        // need this since a single field is passed as a string
        if (!Array.isArray(fields)) {
          fields = [fields];
        }
        // then filter each row in the array of results
        // by only including the specified fields
        result = result.map(record => {
          let partial = {};
          for (let field of fields) {
              partial[field] = record[field];
          }
          return partial;
        });      
      }
      ctx.body = result;
    }    
  }
}

/**
 * Get a user by their ID.
 * 
 * @param {Object} ctx - Koa context object
 * @param {Function} next - Koa next middleware
 */
async function getById(ctx, next) {
  const id = ctx.params.id;
  const result = await model.getById(id);
  if (result.length) {
    const data = result[0]
    const permission = can.read(ctx.state.user, data);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      console.log(ctx.headers);

      const body = permission.filter(data);
      const Etag = etag(JSON.stringify(body));
      const modified = new Date(data.modified);

      let is304 = false;

      const {['if-none-match']:if_none_match} = ctx.headers;
      if (if_none_match === Etag) is304 = true;
      
      const {['if-modified-since']:if_modified_since} = ctx.headers;
      if (modified < Date.parse(if_modified_since)) is304 = true;

      if (is304) {
        ctx.status = 304;
        return next();
      }

      ctx.body = body;
      ctx.set('Last-Modified', modified.toUTCString());
      ctx.set('Etag', Etag);
    }
  }
}


/**
 * Create a new user.
 * 
 * @param {Object} ctx - Koa context object
 */
async function createUser(ctx) {
  const body = ctx.request.body;
  const result = await model.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = {ID: id, created: true, link: `${ctx.request.path}/${id}`};
  }
}

/**
 * Update an existing user by their ID.
 * 
 * @param {Object} ctx - Koa context object
 */
async function updateUser(ctx) {
  const id = ctx.params.id;
  let result = await model.getById(id);  // check it exists
  if (result.length) {
    let data = result[0];
    const permission = can.update(ctx.state.user, data);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      // exclude fields that should not be updated
      const newData = permission.filter(ctx.request.body);
      Object.assign(newData, {ID: id}); // overwrite updatable fields with body data
      result = await model.update(newData);
      if (result.affectedRows) {
        ctx.body = {ID: id, updated: true, link: ctx.request.path};
      }
    }
  }
}

/**
 * Delete a user by their ID.
 * 
 * @param {Object} ctx - Koa context object
 */
async function deleteUser(ctx) {
  const id = ctx.params.id;
  let result = await model.getById(id);
  if (result.length) {
    const data = result[0];
    console.log("trying to delete", data);
    const permission = can.delete(ctx.state.user, data);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      result = await model.delById(id);
      if (result.affectedRows) {
        ctx.body = {ID: id, deleted: true}
      }      
    }
  }
}

module.exports = router;
