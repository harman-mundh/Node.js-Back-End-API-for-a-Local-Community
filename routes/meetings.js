const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const etag = require('etag');
const auth = require('../controllers/authMiddleware');
const can = require('../permissions/users');
const model = require('../models/users');
const {validateUser, validateUserUpdate} = require('../controllers/validationMiddleware');

const Prefix = '/api/v2/meetings';
const router = Router({prefix: Prefix});

// announcements routes
router.get();
router.get();
router.post();
router.put();
router.del();

// views counts
router.get();