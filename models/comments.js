/**
 * A module for performing CRUD methods on comments table in a MySQL database.
 * 
 * @module controllers/comments
 * @author Harman Singh
 */

const db = require('../helpers/database');

/**
 * Get all comments on a given article
 *
 * @param {number} articleID - The ID of the article to retrieve comments for.
 * @returns {Promise} - An array of comment objects.
 * @throws {Error} - If the query fails for any reason.
 */
exports.getAll = async function getAll (articleID) {
  const query = "SELECT * FROM comments WHERE articleID = ?;";
  const data = await db.run_query(query, [articleID]);
  return data;
}

/**
 * Create a new comment (must contain articleID in comment)
 *
 * @param {object} comment - The comment object to add to the database.
 * @param {number} comment.articleID - The ID of the article the comment belongs to.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.add = async function add (comment) {
  const query = "INSERT INTO comments SET ?";
  const data = await db.run_query(query, comment);
  return data;
}

/**
 * Delete a specific comment by ID.
 *
 * @param {number} id - The ID of the comment to be delete.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.deleteById = async function deleteById (id) {
  const query = "DELETE FROM comments WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
}

/**
 * Get a single comment by ID from the database.
 *
 * @param {number} id - The ID of the comment to retrieve.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.getById = async function getById (id) {
  const query = "SELECT * FROM comments WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
}