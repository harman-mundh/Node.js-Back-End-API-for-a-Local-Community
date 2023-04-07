/**
 * KOA basic authorization strategy to for the user and admin role .
 * 
 * @module basic
 * @author Harman Singh
 * @requires passport-http
 * @requires bcrypt
 * @requires models/{users}
 */

const BasicStrategy = require('passport-http').BasicStrategy;
const users = require('../models/users');
const bcrypt = require('bcrypt');

const verifyPassword = function (user, password) {
  // compare hash of password with the stored hash in the DB
  const isMatch = bcrypt.compareSync(password, user.password);
  return isMatch;
}

/**
 * Verify the username and password of the user for authentication.
 * 
 * @param {Object} username,password - The user object, ID and other data.
 * @param {Function} done - Callback function with the verification result
 * @returns {Response} string - return username and message Successful authentication
 * @throws {Error} - If user cannot be found in the database
 */
const checkUserAndPass = async (username, password, done) => {
  // look up the user and check the password if the user exists
  // call done() with either an error or the user, depending on outcome
  let result;

  try {
    result = await users.findByUsername(username);
  } catch (error) {
    console.error(`Error during authentication for user ${username}`);
    return done(error);
  }

  if (result.length) {
    const user = result[0];
    if (verifyPassword(user, password)) {
      console.log(`Successfully authenticated user ${username}`);
      return done(null, user);
    } else {
      console.log(`Password incorrect for user ${username}`);
    }
  } else {
    console.log(`No user found with username ${username}`);
  }
  return done(null, false);
}

const strategy = new BasicStrategy(checkUserAndPass);
module.exports = strategy;
