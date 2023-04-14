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

const axios = require('axios');

 /**
  * Retrieves a single address from the locations table based on lat and longitude cordinates.
  * 
  * @param {number} (latitude, longitude) - location data.
  * @returns {Promise} - An array of objects representing the result of the query.
  * @throws {Error} - If the query fails for any reason.
  */
exports.getGeocodeLatLng = async function getGeocodeLatLng(latitude, longitude, apiKey) {

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${latitude},${longitude}`,
                key: apiKey,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error while attempting to fetch data from geocoding api: ', error);
        return { error: 'Error while attempting to fetch data from geocoding api: '};
    }
};
