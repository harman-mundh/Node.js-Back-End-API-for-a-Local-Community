/**
 * A module for performing CRUD methods on locations table in a MySQL database.
 * 
 * @module models/issues
 * @author Harman Singh
 * @requires ../helpers/database
 */

const db = require('../../helpers/database');
import GmapsAPIke from '../../config';

/**  ---------------------- FIX ------------------
 * Retrieves a user based on email pattern.
 *
 * @param {object} email - The email of the user to search  for.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */

// Get a single location record by its id
exports.getById = async function getById(id) {
  const query = "SELECT * FROM locations WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

// Create a new location record in the database
exports.add = async function add(record) {
  const query = "INSERT INTO locations SET ?";
  const data = await db.run_query(query, record);
  return data;
};

// Delete a location record by its id
exports.delById = async function delById(id) {
  const query = "DELETE FROM locations WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

// Update an existing location record
exports.update = async function update(record) {
  const query = "UPDATE locations SET ? WHERE ID = ?;";
  const values = [record, record.ID];
  const data = await db.run_query(query, values);
  return data;
};