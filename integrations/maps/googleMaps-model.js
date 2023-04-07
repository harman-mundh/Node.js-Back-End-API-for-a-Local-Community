/**
 * A module for performing CRUD methods on locations table in a MySQL database.
 * 
 * @module models/issues
 * @author Harman Singh
 * @requires ../helpers/database
 */

const db = require('../../helpers/database');

/**
 * Retrieves a loaction based on longitude and latitude.
 *
 * @param {number} id - The ID of the location from where to retrive the data from.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.getById = async function getById(id) {
  const query = "SELECT * FROM locations WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
};

/**
 * Create a loaction instance based on data being passed.
 *
 * @param {object} JSON - data containg record to be added in the relative columns.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.add = async function add(record) {
  const query = "INSERT INTO locations SET ?";
  const data = await db.run_query(query, record);
  return data;
};

/**
 * Delete a loaction instance based on ID.
 *
 * @param {number} id - The ID of the Issue to be deleted.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.deleteById = async function deleteById(id) {
  const query = "DELETE FROM locations WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
};

/**
 * Update a loaction based on ID and passed values.
 *
 * @param {object} JSON - data being passed to location table to be update along with the instance ID.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.update = async function update(record) {
  const query = "UPDATE locations SET ? WHERE ID = ?;";
  const values = [record, record.ID];
  const data = await db.run_query(query, values);
  return data;
};