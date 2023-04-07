/**
 * A module for performing CRUD methods on likes table, related with issues in a MySQL database.
 * @module models/issueLikes
 * @author Harman Singh
 */

const db = require('../helpers/database');

/**
 * Adds a new like record to the database for the specified issue and user.
 *
 * @param {number} id - The ID of the issue to add a like record for.
 * @param {number} uid - The ID of the user who is liking the issue.
 * @returns {Promis} - An array of objects representing the result of the query.
 */
exports.like = async function like (id, uid) {
  let query = "INSERT INTO issueLikes SET issueID=?, userID=? ON DUPLICATE KEY UPDATE issueID=issueID; ";
  const result = await db.run_query(query, [id, uid]);
  return result;
}
  
/**
 * Removes a like record from the database for the specified issue and user.
 *
 * @param {number} id - The ID of the issue to remove the like record for.
 * @param {number} uid - The ID of the user who is removing the like from the issue.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.dislike = async function dislike (id, uid) {
  let query = "DELETE FROM issueLikes WHERE issueID=? AND userID=?; ";
  const result = await db.run_query(query, [id, uid]);
  return result;
}
  
/**
 * Counts the number of likes realted with the specified issue.
 *
 * @param {number} id - The ID of the issue to count the likes for.
 * @returns {Promise} An array of objects representing the result of the query.
 */
exports.count = async function count (id) {
  let query = "SELECT count(1) as likes FROM issueLikes WHERE issueID=?;";
  const result = await db.run_query(query, [id]);
  return result[0].likes;
}