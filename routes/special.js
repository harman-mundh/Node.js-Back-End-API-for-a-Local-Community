const Router = require('koa-router');
const auth = require('../controllers/authMiddleware');

const prefix_v1 = '/api/v1';
const router_v1 = Router({prefix: prefix_v1});

const prefix_v2 = '/api/v2';
const router_v2 = Router({prefix: prefix_v2});

// router for v1
router_v1.get('/', publicAPI);
router_v1.get('/private', auth, privateAPI);

// router for v2
router_v2.get("/", publicAPI);
router_v2.get('/private', auth, privateAPI)

/** 
 * take the context path and print API version
 * 
 * @param ctx
 * @return {object} containing message showing the version of the API
*/
function publicAPI(ctx) {  
  const apiVersion = ctx.request.path.startsWith(prefix_v2) ? 'V2' : 'V1';
  ctx.body = {message: `PUBLIC PAGE: You requested a new message URI (root) of the API ${apiVersion}`}
}
/** 
 * take the context path and print API version
 * 
 * @param ctx
 * @return {object} containing message showing the version of the API
*/
function privateAPI(ctx) {
  const user = ctx.state.user;
  const apiVersion = ctx.request.path.startsWith(prefix_v2) ? 'V2' : 'V1';
  ctx.body = {message: `Hello ${user.username} you registered on ${user.dateRegistered} on ${apiVersion}`} 
}

module.exports = {router_v1, router_v2};