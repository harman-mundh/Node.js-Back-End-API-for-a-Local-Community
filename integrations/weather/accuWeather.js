/**
 * AccuWeather API module for getting response coming from the weather third-party API.
 * 
 * @module accuWeather
 * @author Harman Singh
 * @requires axios
 * @resources source: https://developer.accuweather.com/accuweather-forecast-api/apis/get/forecasts/v1/daily/5day/%7BlocationKey%7D
 */

const axios = require('axios');
import {weatherAPIkey, covLocationKey} from '../../config';
import {getCachedAccuData, putResponseAccuData} from './accuWeather-model';

/** 
 * Function to return 5 days worth of weather information for Coventry.
 * 
 * @requires {axios} - A popular library for  http requests.
 * @requires {weatherAPIkey, covLocationKey} key - API and city key which are saved on root path.
 * @function {getCachedAccuData} Data - tries to get existing stored data that was store within 24 hours
 * @function {putResponseAccuData} Data - if data not found, get response from API and saves it in DB
 * @returns {Object} - JSON data response to API request.
 * @throws {Error} - If the query fails for any reason.
 */
 exports.getCovWeather = async function getCovWeather() {

    cityKey = covLocationKey;
    API_key = weatherAPIkey;
    const accuForecastUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${cityKey}?apikey=${API_key}&details=true`;
    
    let weatherData = await getCachedAccuData();

    if (!weatherData) {
      try {
      const response = await axios.get(accuForecastUrl);
      weatherData = response.data;
      await putResponseAccuData(weatherData);
      } catch (error) {
        throw new Error('Error while attempting to fetch data from accu weather api: ', error);
      }
    }

    return weatherData;
};

