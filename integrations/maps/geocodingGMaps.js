/**
 * Google Maps API module for managing resources coming from the third-party API.
 * 
 * @module geocodingGMaps
 * @author Harman Singh
 * @requires axios
 * @requires models/googleMaps-model
 * @resources Sources: https://developers.google.com/maps/documentation/javascript/geocoding
 * @resources Sources: https://developers.google.com/maps/documentation/geocoding/start
 */

import { GmapsAPIkey } from '../../config';
 const axios = require('axios');

 /** -------------FIX-------------
  * Retrieves a single issue from the database by its ID.
  * 
  * @param {number} id - The ID of the issue to retrieve.
  * @returns {Promise} - An array of objects representing the result of the query.
  * @throws {Error} - If the query fails for any reason.
  */
exports.getGeocodeLatLng = async function getGeocodeLatLng(latitude, longitude) {
    const apiKey =  GmapsAPIkey; 

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${latitude},${longitude}`,
                key: apiKey,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Error while attempting to fetch data from geocoding api: ', error);
    }
};

 