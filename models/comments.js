/**
 * A module for performing CRUD methods on comments table in a MySQL database.
 * 
 * @module controllers/comments
 * @author Harman Singh
 */

const db = require('../helpers/database');

/**
 * Get all comments on a given Issue
 *
 * @param {number} issueID - The ID of the Issue to retrieve comments for.
 * @returns {Promise} - An array of comment objects.
 */
exports.getAll = async function getAll (issuesID) {
  const query = "SELECT * FROM comments WHERE issuesID = ?;";
  const data = await db.run_query(query, [issuesID]);
  return data;
}

/**
 * Create a new comment (must contain issueID in comment)
 *
 * @param {object} comment - The comment object to add to the database.
 * @param {number} comment.issuesID - The ID of the issues the comment belongs to.
 * @returns {Promise} - An array of objects representing the result of the query.
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
 */
exports.getById = async function getById (id) {
  const query = "SELECT * FROM comments WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
}