/**
 * A module for performing CRUD methods on the announcementViews table in a MySQL database.
 * 
 * @module models/announcementsViews
 * @author Harman Singh
 */

 const db = require('../helpers/database');

 /** Add a new view record each time an issue is viewed by unique user
 * 
 * @param {number} id - The ID of the announcemet to add a view to.
 * @returns {Promise} - An array of objects representing the result of the query.
 */ 
 exports.add = async function add(id) {
   let query = "INSERT INTO announcementViews SET announcementId=?;";
   const result = await db.run_query(query, [id]);
   return result;
 }
 
 /** Count how many announcement id the view has stored
 * 
 * @param {number} id - The ID of the view to be counted.
 * @returns {Promise} - An array of objects representing the result of the query.
 */ 
 exports.count = async function count(id) {
   let query = "SELECT count(1) as views FROM announcementViews WHERE announcementId=?;";
   const result = await db.run_query(query, [id]);
   return result;
 }