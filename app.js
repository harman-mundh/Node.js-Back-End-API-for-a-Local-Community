const Koa = require('koa');
const cors = require('@koa/cors');
const app = new Koa();
require('dotenv').config();

app.use(cors());

//importing the routes
const {router, router_v2} = require('./routes/special.js')
const issues = require('./routes/issues.js');
const users = require('./routes/users.js');
const categories = require('./routes/categories.js');
const comments = require('./routes/comments.js');
// const uploads = require('./routes/uploads.js');

// using and allowing the routes
app.use(router.routes());
app.use(router_v2.routes());
app.use(issues.routes());
app.use(users.routes());
app.use(categories.routes());
app.use(comments.routes());
// app.use(uploads.routes());
//app.use(passport.initiliaze())

//app.use(router.allowedMethods());
//app.use(router_v2.allowedMethods());

module.exports = app;