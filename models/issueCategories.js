/**
 * A module for performing CRUD methods on the issue's categories in a MySQL database.
 * 
 * @module models/issuecategories
 * @author Harman Singh
 */

const db = require('../helpers/database');

/**
 * Adds a categories to an issue in the database, if it is not already present.
 *
 * @param {number} id - The ID of the issue to add the categories to.
 * @param {number} categoriesID - The ID of the categories to add to the issue.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.add = async function add (id, categoriesID) {
  let query = "INSERT INTO issuecategories SET issueID=?, categoriesID=?";
      query += " ON DUPLICATE KEY UPDATE issueID=issueID; ";
  const result = await db.run_query(query, [id, categoriesID]);
  return result;
}

/**
 * Removes a categories from an issue in the database, if it exists.
 *
 * @param {number} id - The ID of the issue to remove the categories from.
 * @param {number} categoriesID - The ID of the categories to remove from the issue.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} If the query fails for any reason.
 */
exports.delete = async function delete_ (id, categoriesID) {
  let query = "DELETE FROM issuecategories WHERE issueID=? AND categoriesID=?;";
  const result = await db.run_query(query, [id, categoriesID]);
  return result;
}
/**
 * Retrieves all categories of a given issue.
 *
 * @param {number} id - The ID of the issue to retrieve the categories for.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} If the query fails for any reason.
 */
exports.getAll = async function getAll (id) {
  let query = "SELECT c.ID, c.name FROM issuecategories as ac INNER JOIN categories AS c";
      query += " ON ac.categoriesID = c.ID WHERE ac.issueID = ?;";
  const result = await db.run_query(query, id);
  return result;
}
