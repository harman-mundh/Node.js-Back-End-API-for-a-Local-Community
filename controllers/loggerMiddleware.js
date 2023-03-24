/**
 * KOA router module for managing resources related to issues resources with HTTP methods.
 * 
 * @module issueRoutes
 * @author Harman Singh
 * @requires koa,koa-bodyparser
 * @requires permissions/issues
 * @requires models/{issues, issuesViews, issueCatergories, commets, likes} 
 * @source https://github.com/gitdagray/mern_stack_course/blob/main/lesson_13-backend/middleware/logger.js
 */

const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

/**
 * Log events to a specified log file.
 * @async
 * @param {string} message - The message to be logged.
 * @param {string} logFileName - The name of the log file.
 */
const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
    }
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Koa middleware to log request events.
 * @async
 * @param {Object} ctx - Koa context object.
 * @param {Function} next - Koa next function.
 */
const logger = async (ctx, next) => {
  logEvents(`${ctx.method}\t${ctx.url}\t${ctx.headers.origin}`, 'reqLog.log');
  console.log(`${ctx.method} ${ctx.path}`);
  await next();
};

module.exports = { logEvents, logger };
