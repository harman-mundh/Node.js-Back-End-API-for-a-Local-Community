/**
 * KOA router module for managing resources related to issues resources with HTTP methods.
 * 
 * @module issueRoutes
 * @author Harman Singh
 * @requires koa,koa-bodyparser
 * @requires permissions/issues
 * @requires models/{issues, issuesViews, issueCatergories, commets, likes}
 * @reference source: http://www.passportjs.org/packages/passport-jwt/ 
 * @reference source: https://medium.com/@rob.s.ellis/koa-api-secured-with-passport-jwt-2fd2d32771bd
 * @reference source: https://github.com/truthseekers/passport-jwt-tutorial/tree/master/server
 */

import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import users from '../models/users';
import { ExtractJwt } from 'passport-jwt';
const secretKey = process.env.SECRET_KEY;

// configure the jwt strategy options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
  algorithms: ['HS256'],
}

/**
 * Verify the JWT token payload given the user ID and return the object along with the role.
 * 
 * @param {Object} jwt_payload - The user object, ID and other data.
 * @param {Function} done - Callback function with the verification result
 * @returns {Promise} JSON - object with the role of the user
 * @throws {Error} - If user cannot be found in the database
 */
exports.verifyToken = async function (jwt_payload, done) {
  try{
    // function to find the user in the database given the ctx from paylod
    const result = await users.findById(jwt_payload.id);

    if (result.lenght){
      const user = result[0];
      // user is found, returned with along with the role
      return done(null, user);
    } else {
      // user not found
      return done(null, false)
    }
  } catch (error) {
    console.error(`Error during JWT authentication: ${error.message}`);
    return done(error);
  }
};

// creating the new strategy with the given options and callback function 
const strategy = new JwtStrategy(jwtOptions, verifyToken);

module.exports = strategy;