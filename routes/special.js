const Router = require('koa-router');
const auth = require('../controllers/authMiddleware');

const Prefix = '/api/v1'; 
const router = Router({prefix: Prefix});

const Prefix_v2 = '/api/v2'; 
const router_v2 = Router({prefix: Prefix_v2});

// router for v1
router.get('/', publicAPI);
router.get('/private', auth, privateAPI);

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
  const apiVersion = ctx.request.path.startsWith(Prefix_v2) ? 'V2' : 'V1';
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
  const apiVersion = ctx.request.path.startsWith(Prefix_v2) ? 'V2' : 'V1';
  ctx.body = {message: `Hello ${user.username} you registered on ${user.dateRegistered} on ${apiVersion}`} 
}

module.exports = {router, router_v2};