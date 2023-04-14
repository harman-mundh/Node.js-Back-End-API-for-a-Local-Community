/**
 * A module for performing CRUD methods on weather cache table in a MySQL database.
 * 
 * @module accuWeather-model
 * @author Harman Singh
 * @requires ../helpers/database
 */

 const db = require('../../helpers/database');

 /** 
 * Retrieves a Accu weather data from cache table.
 *
 * @returns {JSON||NULL} - function returns the data saved within the last 24 hours or null if not available.
 */
exports.getCachedAccuData = async function getCachedAccuData() {
    const query = `SELECT data FROM weather_cache
                    ORDER BY last_updated DESC LIMIT 1;
                    `;
    const result = await db.run_query(query);
    return result.length ? result[0].data : null;
}

 /** 
 * Use API get response to save weather data into table weather cache.
 *
 * @param {Object} data - Weather API 5 days resonse data in json form to be stored.
 * @return {Promise} data - Console log data saved in table or throws error.
 */
exports.putResponseAccuData = async function putResponseAccuData(response) {
    const query = "INSERT INTO weather_cache (data) VALUES (?);";
    await db.run_query(query, [JSON.stringify(response)]);
}