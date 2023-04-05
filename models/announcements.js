/**
 * A module for performing CRUD methods on announcements table in a MySQL database.
 * 
 * @module models/announcements
 * @author Harman Singh
 */

 const db = require('../helpers/database');

 /**
 * Retrieves a single announcement from the database by its ID.
 * 
 * @param {number} id - The ID of the announcement to retrieve.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */
exports.getById = async function getById (id) {
    const query = "SELECT * FROM announcements WHERE ID = ?;";
    const values = [id];
    const data = await db.run_query(query, values);
    return data;
  }
  
  /**
   * List all the announcements from the database.
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
      query = "SELECT * FROM announcements ORDER BY ?? DESC LIMIT ? OFFSET ?;";
    } else {
      query = "SELECT * FROM announcements ORDER BY ?? ASC LIMIT ? OFFSET ?;";    
    }
    const values = [order, limit, offset];
    const data = await db.run_query(query, values);
    return data;
  }
  
  /**
   * Create a new announcement in the database.
   *
   * @param {object} announcement - The announcement object to added into the database.
   * @returns {Promise} - An array of objects representing the result of the query.
   * @throws {Error} - If the query fails for any reason.
   */
  exports.add = async function add (announcement) {
    const query = "INSERT INTO announcements SET ?";
    const data = await db.run_query(query, announcement);
    return data;
  }
  
  /**
   * Delete an announcement from the database by its ID.
   *
   * @param {number} id - The ID of the announcement to deleted.
   * @returns {Promise} - An array of objects representing the result of the query.
   * @throws {Error} - If the query fails for any reason.
   */
  exports.delById = async function delById (id) {
    const query = "DELETE FROM announcements WHERE ID = ?;";
    const values = [id];
    const data = await db.run_query(query, values);
    return data;
  }
  
  /**
   * Update an existing announcement in the database by its ID.
   *
   * @param {object} announcement - The updated issue object.
   * @param {string} announcement.ID - The ID of the announcement to update.
   * @throws {Error} - If the query fails for any reason.
  */
  exports.update = async function update (announcement) {
    const query = "UPDATE announcements SET ? WHERE ID = ?;";
    const values = [announcement, announcement.ID];
    const data = await db.run_query(query, values);
    return data;
  }