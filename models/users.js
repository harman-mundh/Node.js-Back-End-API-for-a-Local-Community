/**
 * A module for performing CRUD methods on users table in a MySQL database.
 * 
 * @module models/users
 * @requires ../helpers/database
 */

const db = require('../helpers/database');
const bcrypt = require('bcrypt');
//const { isStatusCode } = require('redoc');

/**
 * Retrieves a user based on email pattern.
 *
 * @param {object} email - The email of the user to search  for.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.emailSearch = async function emailSearch (email) {
  const query = "SELECT * FROM users WHERE email LIKE ?;";
  const data = await db.run_query(query, '%'+email+'%');
  return data;
}

/**
 * Retrieves a single user by its ID.
 *
 * @param {number} id - The ID of the user to retrieved.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.getById = async function getById (id) {
  const query = "SELECT * FROM users WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

/**
 * Retrieves a single user by the (unique) username used for authentication.
 *
 * @param {string} username - The username of the user to be retrieved.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.findByUsername = async function getByUsername(username) {
  const query = "SELECT * FROM users WHERE username = ?;";
  const user = await db.run_query(query, username);
  return user; 
}

/**
 * Retrieves all users from the database.
 *
 * @param {number} limit - The maximum number of results to return DEFAULT=10.
 * @param {number} page - The page number to retrieve DEFAULT=1.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.getAll = async function getAll (limit=10, page=1) {
  const offset = (page - 1) * limit;
  const query = "SELECT * FROM users LIMIT ?,?;";
  const data = await db.run_query(query, [offset, limit]);
  return data;
}


/**
 * Add a new user in the database.
 *
 * @param {object} user - The user object to be added in the database.
 * @param {string} user.password - The unencrypted (STRING) password of the new user.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.add = async function add (user) {
  const query = "INSERT INTO users SET ?";
  const password = user.password;
  const hash = bcrypt.hashSync(password, 10);
  user.password = hash;
  const data = await db.run_query(query, user);
  return data;
}

/**
 * Update an existing user
 * 
 * @param {object} user - User object to be updated
 * @return {Promise} - An array of objects representing the result of the query.
 */
exports.update = async function update (user) {
  const query = "UPDATE users SET ? WHERE ID = ?;";
  if (user.password) {
    const password = user.password;
    const hash = bcrypt.hashSync(password, 10);
    user.password = hash;  
  }
  const values = [user, user.ID];
  const data = await db.run_query(query, values);
  return data;
}

/**
 * Delete a user by specified ID.
 *
 * @param {number} id - The ID of the user to be deleted.
 * @function {number} id - call function to perform soft delete.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
 exports.delById = async function delById (id) {
  const issueCount = await getIssuesByAuthorId(id);
  if (issueCount > 0) {
      await updateAuthorId(id);
  }

  const query = "DELETE FROM users WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

/**
 * Function used to preserve data on the API,
 * before a user is delete all their post are 
 * trasfered to placeholder user deletedUser (soft Delete the user)
 * 
 * @param {object} ID - user ID  
 * @returns {Promise} - An array of objects representing the result of the query
 */
async function updateAuthorId(id) {
  const query = "UPDATE issues SET authorID = 2 WHERE authorID = ?;";
  const values = [id];
  const data = await  db.run_query(query, values);
  return data;
 };

 /**
 * Function used to preserve data on the API,
 * before a user is delete all their post are counted
 * 
 * @param {object} ID - user ID  
 * @returns {number} - count post by the author if any
 */
async function getIssuesByAuthorId(id) {
  const query = "SELECT COUNT(*) as issue_count FROM issues WHERE authorID = ?;";
  const values = [id];
  const data = await  db.run_query(query, values);
  return data[0].issue_count;
  };