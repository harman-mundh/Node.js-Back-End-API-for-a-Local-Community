/**
 * KOA router module for managing resources related to issues resources with HTTP methods.
 * 
 * @module issueRoutes
 * @author Harman Singh
 * @requires koa,koa-bodyparser
 * @requires permissions/issues
 * @requires models/{issues, issuesViews, issueCatergories, commets, likes} 
 */

const jwt = require('jsonwebtoken');

/**
 * Create a JWT token for the user.
 * @param {Object} user - The user object.
 * @param {string} user._id - The user's ID.
 * @param {string} user.email - The user's email.
 * @param {string} user.role - The user's role.
 * @returns {string} The generated JWT token.
 */
exports.createToken = function createToken(user) {
  const userinfo = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(userinfo, info.config.jwt_secret, {
    expiresIn: "24h",
  });

  return token;
};

/**
 * Koa middleware to check the JWT token in the request header.
 * @async
 * @param {Object} ctx - Koa context object.
 * @param {Function} next - Koa next function.
 * @throws {Error} If the token is not provided or is invalid.
 */
exports.checkToken = async function checkToken(ctx, next) {
  const authHeader = ctx.request.header.authorization;

  if (!authHeader) {
    ctx.throw(401, "No token");
  }

  const token = authHeader.split(" ")[1];

  try {
    const checkedToken = jwt.verify(token, info.config.jwt_secret);
    ctx.state.user = checkedToken;
    await next();
  } catch (err) {
    console.error(err);
    ctx.throw(401, "Invalid token");
  }
};
