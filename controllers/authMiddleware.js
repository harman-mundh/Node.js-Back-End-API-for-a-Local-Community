/**
 * Set up passport and its authentication strategies.
 * Importing this module in a route gives a middleware handler that can be used
 * to protect downstream handlers by rejecting unauthenticated requests.
 * @module authMiddleware
 * @author Harman Singh
 */

const passport = require('koa-passport');
const basicAuth = require('../strategies/basic');

 /**
  * Sets up the basic authentication strategy for passport to use.
  */
passport.use(basicAuth);
 
module.exports = passport.authenticate(['basic'], {session:false});
 