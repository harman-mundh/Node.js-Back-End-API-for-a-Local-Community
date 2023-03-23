/**
 * A module for performing CRUD methods on likes for managing status
 * record of the issue in a MySQL database.
 * @module models/statuses
 * @author Harman Singh
 */

const db = require('../helpers/database');

/**
 * Lists all status records in the database.
 *
 * @returns {Promise} - An array of objects representing the status records.
 * @throws {Error} - If the query fails for any reason.
 */
exports.getAll = async function getAll () {
  const query = "SELECT * FROM statuses;";
  const data = await db.run_query(query);
  return data;
}

/**
 * Retrieves a single status record from the database by its ID.
 *
 * @param {number} id - The ID of the status record to retrieve.
 * @returns {Promise} - An array of objects representing the retrieved status record.
 * @throws {Error} - If the query fails for any reason.
 */
exports.getById = async function getById (id) {
  const query = "SELECT * FROM statuses WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
}

/**
 * Create a new status record in the database.
 *
 * @param {object} status - An object representing the status record to add.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.add = async function add (status) {
  const query = "INSERT INTO statuses SET ?;";
  const data = await db.run_query(query, status);
  return data;
}

/**
 * Updates an existing status record in the database.
 *
 * @param {object} status - An object representing the status record to update.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.update = async function add (status) {
  const query = "UPDATE statuses SET ? WHERE ID=?;";
  const data = await db.run_query(query, [status, status.ID]);
  return data;
}

/**
 * Deletes a status record from the database by its ID.
 *
 * @param {number} id - The ID of the status record to delete.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.delById = async function delById (id) {
  const query = "DELETE FROM statuses WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
}