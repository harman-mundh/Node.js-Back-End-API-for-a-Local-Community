/**
 * A module for performing CRUD methods on issuesViews table in a MySQL database.
 * 
 * @module models/issues
 * @author Harman Singh
 */

const db = require('../helpers/database');

/** Add a new view record each time an issue is viewed by unique user
 * 
 * @param {number} id - The ID of the issues to add a view to.
 * @returns {Promise} - An array of objects representing the result of the query.
 */ 
exports.add = async function add (id) {
  let query = "INSERT INTO issueViews SET issueId=?; ";
  const result = await db.run_query(query, [id]);
  return result;
}

/** Count how many issues id the view table has stored
 * 
 * @param {number} id - The ID of the view to be counted.
 * @returns {Promise} - An array of objects representing the result of the query.
 */ 
exports.count = async function count (id) {
  let query = "SELECT count(1) as views FROM issuesViews WHERE issuesId=?;";
  const result = await db.run_query(query, [id]);
  return result;
}