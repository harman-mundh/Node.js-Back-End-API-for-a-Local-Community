/**
 * A module for performing CRUD methods on meetings table in a MySQL database.
 * 
 * @module models/meetings
 * @author Harman Singh
 */

 const db = require('../helpers/database');

 /**
 * Retrieves a single meeting from the database by its ID.
 * 
 * @param {number} id - The ID of the meeting to retrieve.
 * @returns {Promise} - An array of objects representing the result of the query.
 */
exports.getById = async function getById (id) {
    let query = "SELECT * FROM meetings WHERE ID = ?;";
    let values = [id];
    let data = await db.run_query(query, values);
    return data;
  }
  
  /**
   * List all the meetings from the database.
   *
   * @param {number} page - The page number to retrieve.
   * @param {number} limit - The maximum number of results to return.
   * @param {string} order - The column by which to order the results.
   * @param {string} direction - The direction in which to order the results.
   * @returns {Promise} - An array of objects representing the result of the query.
   */
  exports.getAll = async function getAll (page, limit, order, direction) {
    const offset = (page - 1) * limit;
    let query;
    if (direction === 'DESC') {
      query = "SELECT * FROM meetings ORDER BY ?? DESC LIMIT ? OFFSET ?;";
    } else {
      query = "SELECT * FROM meetings ORDER BY ?? ASC LIMIT ? OFFSET ?;";    
    }
    const values = [order, limit, offset];
    const data = await db.run_query(query, values);
    return data;
  }
  
  /**
   * Create a new meeting in the database.
   *
   * @param {object} meeting - The meeting object to added into the database.
   * @returns {Promise} - An array of objects representing the result of the query.
   */
  exports.add = async function add (meeting) {
    const query = "INSERT INTO meetings SET ?";
    const data = await db.run_query(query, meeting);
    return data;
  }
  
  /**
   * Delete an meeting from the database by its ID.
   *
   * @param {number} id - The ID of the meeting to deleted.
   * @returns {Promise} - An array of objects representing the result of the query.
   */
  exports.delById = async function delById (id) {
    const query = "DELETE FROM meetings WHERE ID = ?;";
    const values = [id];
    const data = await db.run_query(query, values);
    return data;
  }
  
  /**
   * Update an existing meeting in the database by its ID.
   *
   * @param {object} meeting - The updated meeting object.
   * @param {string} meeting.ID - The ID of the article to updated.
  */
  exports.update = async function update (meeting) {
    const query = "UPDATE meetings SET ? WHERE ID = ?;";
    const values = [meeting, meeting.ID];
    const data = await db.run_query(query, values);
    return data;
  }