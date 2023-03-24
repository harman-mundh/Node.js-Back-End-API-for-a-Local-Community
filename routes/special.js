const Router = require('koa-router');
const auth = require('../controllers/authMiddleware');

const Prefix = '/api/v1'; 
const router = Router({prefix: Prefix});

const Prefix_v2 = '/api/v2'; 
const router_v2 = Router({prefix: Prefix_v2});

router.get('/', publicAPI);
router.get('/private', auth, privateAPI);

router_v2.get("/", publicAPI_v2);
router_v2.get('/private', auth, privateAPI)

function publicAPI(ctx) {  
  ctx.body = {message: 'PUBLIC PAGE: You requested a new message URI (root) of the API V1'}
}

function publicAPI_v2(ctx) {  
  ctx.body = {message: 'PUBLIC PAGE: You requested a new message URI (root) of the API V2'}
}

function privateAPI(ctx) {
  const user = ctx.state.user;
  ctx.body = {message: `Hello ${user.username} you registered on ${user.dateRegistered}`} 
}


module.exports = router;
module.exports = router_v2;
