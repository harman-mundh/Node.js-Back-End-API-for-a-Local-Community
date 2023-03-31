/**
 * AccuWeather API module for getting response coming from the third-party API.
 * 
 * @module accuWeather
 * @author Harman Singh
 * @requires axios
 * @resources source: https://developer.accuweather.com/accuweather-forecast-api/apis/get/forecasts/v1/daily/5day/%7BlocationKey%7D
 */

const axios = require('axios');
import {weatherAPIkey, covLocationKey} from '../../config';

/** 
 * Function to return 5 days worth of weather information for Coventry.
 * 
 * @requires {axios} - A popular library for  http requests.
 * @requires {weatherAPIkey, covLocationKey} key - API and city key which are saved on root path.
 * @returns {Object} - JSON data response to API request.
 * @throws {Error} - If the query fails for any reason.
 */
 exports.getCovWeather = async function getCovWeather() {

    cityKey = covLocationKey;
    API_key = weatherAPIkey;
    const accuForecastUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${cityKey}?apikey=${API_key}&details=true`;
    
    try {
        const response = await axios.get(accuForecastUrl);
        ctx.body = response.data;
      } catch (error) {
        throw new Error('Error while attempting to fetch data from accu weather api: ', error);
      }
};
