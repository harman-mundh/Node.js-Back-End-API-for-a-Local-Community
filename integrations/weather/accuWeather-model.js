/**
 * A module for performing CRUD methods on locations table in a MySQL database.
 * 
 * @module models/issues
 * @author Harman Singh
 * @requires ../helpers/database
 */

 const db = require('../../helpers/database');

 /**  ---------------------- FIX ------------------
 * Retrieves a user based on email pattern.
 *
 * @param {object} email - The email of the user to search  for.
 * @returns {Promise} - An array of objects representing the result of the query.
 * @throws {Error} - If the query fails for any reason.
 */

exports.getCachedAccuData = async function getCachedAccuData(locationID) {
    const query = `SELECT data FROM weather_cache
                    WHERE last_updated >= (NOW() - INTERVAL 24 HOUR)
                    ORDER BY last_updated DESC LIMIT 1;
                    `;
    const data = await db.run_query(query, locationID);
    return data;
}

exports.putResponseAccuData = async function putResponseAccuData(response) {
    const query = "INSERT INTO weather_cache (data) VALUES ?;";
    await db.run_query(query, [JSON.stringify(response)]);
}