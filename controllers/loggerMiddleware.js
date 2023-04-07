/**
 * KOA middleware for logging security events on the application when HTTP methods are called.
 * 
 * @module loggerMiddleware
 * @author Harman Singh
 * @requires {fs, path}
 * @source https://github.com/gitdagray/mern_stack_course/blob/main/lesson_13-backend/middleware/logger.js
 * @source https://www.npmjs.com/package/winston
 * @source https://www.npmjs.com/package/koa-logger
 */

const winston = require('winston');

/**
 * Log events to a specified log file.
 * @async
 * @param {string} message - The message to be logged.
 * @param {string} logFileName - The name of the log file.
 */
exports.logger = async function logger(ctx, next) {
  await next();
}

