const Koa = require('koa');
const app = new Koa();
const cors = require('@koa/cors');
const etag = require('koa-etag');
const conditional = require('koa-conditional-get');
require('dotenv').config();
const logger = require('koa-logger');

app.use(etag());
app.use(conditional());
app.use(cors());
app.use(logger());

//importing the routes
const {router_v1, router_v2} = require('./routes/special.js')
const issues = require('./routes/issues.js');
const commonUserRoutes = require('./routes/users.js');
const categories = require('./routes/categories.js');
const comments = require('./routes/comments.js');
const uploads = require('./routes/uploads.js');
const meetings = require('./routes/meetings.js');
const announcements = require('./routes/announcements.js');

// using and allowing the basic routes for public and private
app.use(router_v1.routes());
app.use(router_v2.routes());

// accessing users URI from both v1 and v2 versions of the API
const usersRoutes_v1 = commonUserRoutes('/api/v1/users');
const usersRoutes_v2 = commonUserRoutes('/api/v2/users');

// using and allowing the resources routes
app.use(issues.routes());
app.use(usersRoutes_v1.routes());
app.use(usersRoutes_v2.routes());
app.use(categories.routes());
app.use(comments.routes());
app.use(uploads.routes());
app.use(meetings.routes());
app.use(announcements.routes());

//app.use(passport.initiliaze())

module.exports = app;