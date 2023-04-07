/**
 * KOA jwt authorization strategy to for the user and admin role .
 * 
 * @module jwt
 * @author Harman Singh
 * @requires passport-jwt
 * @requires secretKey - env saved locally not tracked
 * @requires models/{users}
 * @reference source: http://www.passportjs.org/packages/passport-jwt/ 
 * @reference source: https://medium.com/@rob.s.ellis/koa-api-secured-with-passport-jwt-2fd2d32771bd
 * @reference source: https://github.com/truthseekers/passport-jwt-tutorial/tree/master/server
 * @reference source: https://www.youtube.com/watch?v=Tau0ZMJ4aR0&ab_channel=TruthSeekers
 * @reference source: https://github.com/truthseekers/passport-jwt-tutorial/blob/master/server/app.js
 */

const users = require('../models/users');
const JwtStrategy= require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const secretKey = process.env.SECRET_KEY;

// configure the jwt strategy options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromUrlQueryParameter("jwt"),
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
const verifyToken = async function (jwt_payload, done) {
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