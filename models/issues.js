/**
 * A module for performing CRUD methods on issues table in a MySQL database.
 * 
 * @module models/issues
 * @author Harman Singh
 */

const db = require('../helpers/database');

/**
 * Retrieves a single issue from the database by its ID.
 * 
 * @param {number} id - The ID of the issue to retrieve.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.getById = async function getById (id) {
  const query = "SELECT * FROM issues WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

/**
 * List all the issues from the database.
 *
 * @param {number} page - The page number to retrieve.
 * @param {number} limit - The maximum number of results to return.
 * @param {string} order - The column by which to order the results.
 * @param {string} direction - The direction in which to order the results.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.getAll = async function getAll (page, limit, order, direction) {
  const offset = (page - 1) * limit;
  let query;
  if (direction === 'DESC') {
    query = "SELECT * FROM issues ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query = "SELECT * FROM issues ORDER BY ?? ASC LIMIT ? OFFSET ?;";    
  }
  const values = [order, limit, offset];
  const data = await db.run_query(query, values);
  return data;
}

/**
 * Create a new issue in the database.
 *
 * @param {object} issue - The issue object to added into the database.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.add = async function add (issue) {
  const query = "INSERT INTO issues SET ?";
  const data = await db.run_query(query, issue);
  return data;
}

/**
 * Delete an issue from the database by its ID.
 *
 * @param {number} id - The ID of the issue to deleted.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.delById = async function delById (id) {
  const query = "DELETE FROM issues WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

/**
 * Update an existing issue in the database by its ID.
 *
 * @param {object} issue - The updated issue object.
 * @param {string} issue.ID - The ID of the article to updated.
 * @throws {Error} - If the query fails for any reason.
*/
exports.update = async function update (issue) {
  const query = "UPDATE issues SET ? WHERE ID = ?;";
  const values = [issue, issue.ID];
  const data = await db.run_query(query, values);
  return data;
}