/**
 * A module for performing CRUD methods on the issue's status in a MySQL database.
 * 
 * @module models/issueStatus
 * @author Harman Singh
 */

const db = require('../helpers/database');

/**
 * Adds a status to an issue in the database, if it is not already present.
 *
 * @param {number} id - The ID of the issue to add the status to.
 * @param {number} statusID - The ID of the status to add to the issue.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.add = async function add (id, statusID) {
  let query = "INSERT INTO issueStatus SET issueID=?, statusID=?";
      query += " ON DUPLICATE KEY UPDATE issueID=issueID; ";
  const result = await db.run_query(query, [id, statusID]);
  return result;
}

/**
 * Removes a status from an issue in the database, if it exists.
 *
 * @param {number} id - The ID of the issue to remove the status from.
 * @param {number} statusID - The ID of the status to remove from the issue.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} If the query fails for any reason.
 */
exports.delete = async function delete_ (id, statusID) {
  let query = "DELETE FROM issueStatus WHERE issueID=? AND statusID=?;";
  const result = await db.run_query(query, [id, statusID]);
  return result;
}
/**
 * Retrieves all status of a given issue.
 *
 * @param {number} id - The ID of the issue to retrieve the status for.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} If the query fails for any reason.
 */
exports.getAll = async function getAll (id) {
  let query = "SELECT c.ID, c.name FROM issueStatus as ac INNER JOIN status AS c";
      query += " ON ac.statusID = c.ID WHERE ac.issueID = ?;";
  const result = await db.run_query(query, id);
  return result;
}
