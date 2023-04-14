/**
 * AccuWeather API module for getting response coming from the weather third-party API.
 * 
 * @module accuWeather
 * @author Harman Singh
 * @requires axios
 * @resources source: https://developer.accuweather.com/accuweather-forecast-api/apis/get/forecasts/v1/daily/5day/%7BlocationKey%7D
 * @resources source: https://www.visualcrossing.com/resources/documentation/weather-api/how-to-load-weather-data-in-javascript/ 
 * @resources source: https://developer.accuweather.com/accuweather-forecast-api/apis
 * @resources source: https://www.youtube.com/watch?v=KQ_nHbnAzPc&ab_channel=Andy%27sTechTutorials
*/

const axios = require('axios');
const {weatherAPIkey, covLocationKey} = require('../../config');
const {getCachedAccuData, putResponseAccuData} = require('./accuWeather-model');

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
    const accuForecastUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${cityKey}?apikey=${API_key}&details=false`;
    
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
    
    weatherData = JSON.parse(weatherData);
    let extractedData = [];
    if (weatherData.DailyForecasts && weatherData.DailyForecasts.length > 0) {
      extractedData = weatherData.DailyForecasts.map(day => {
        let date = undefined;
        if (day.Date) {
          date = new Date(day.Date);
        }
        const minTemp = day.Temperature.Minimum.Value;
        const maxTemp = day.Temperature.Maximum.Value;
        const precipitation = String (day.Day.PrecipitationType);
        const intesity = String (day.Day.PrecipitationIntensity);
        const shortPhase = String (day.Day.ShortPhrase);
        const longPhase = String (day.Day.LongPhrase);
        const hoursOfPrecipitation = `Hours of rain: ${Number (day.Day.HoursOfPrecipitation)}`;
        return {
          date: date,
          minTemp: `${Math.round((minTemp - 32) * (5/9))} C`,
          maxTemp: `${Math.round((maxTemp - 32) * (5/9))} C`,
          precipitationCategory: precipitation,
          precipitationIntensity: intesity,
          shortPhase: shortPhase,
          longPhase: longPhase,
          hoursOfPrecipitation: hoursOfPrecipitation  
        };
      });
    }
    return extractedData;
};
