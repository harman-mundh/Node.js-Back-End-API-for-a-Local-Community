const Koa = require('koa');
const app = new Koa();
const cors = require('@koa/cors');
const etag = require('koa-etag');
const conditional = require('koa-conditional-get');
require('dotenv').config();

app.use(etag());
app.use(conditional());
app.use(cors());

//importing the routes
const {router_v1, router_v2} = require('./routes/special.js')
const IssueRoutes = require('./routes/issues.js');
const users = require('./routes/users.js');
const categories = require('./routes/categories.js');
const comments = require('./routes/comments.js');
// const uploads = require('./routes/uploads.js');

// using and allowing the routes
app.use(router_v1.routes());
app.use(router_v2.routes());
app.use(IssueRoutes(router_v1).routes());

app.use(users.routes());
app.use(categories.routes());
app.use(comments.routes());
// app.use(uploads.routes());
//app.use(passport.initiliaze())

module.exports = app;