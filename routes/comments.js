/**
 * KOA router module for managing comment resources with HTTP methods.
 * 
 * @module routes/comments
 * @author Harman Singh
 * @requires models/comments
 * @requires controllers/authMiddleware
 */

const Router = require('koa-router');
const auth = require('../controllers/authMiddleware');
const comments = require('../models/comments');

// Endpoint prefix
const prefix_v1 = '/api/v1/comments'; 
const router = Router({Prefix: prefix_v1});

/**
 * Delete a comment by ID.
 * 
 * @param {object} ctx Koa body context object.
 * @returns {object} Koa response body with ID and deleted boolean value TRUE.
 * @throws {Error} - A generic error if the query fails for an unknown reason.
*/
async function deleteById(ctx) {
  const id = ctx.params.id;
  const result = await comments.deleteById(id);
  if (result.affectedRows) {
    ctx.body = {ID: id, deleted: true}
  }
}

/**
 * Get a comment by ID
 * 
 * @param {object} ctx Koa context object.
 * @returns {object} Koa response body with a single comment object.
 * @throws {Error} - A generic error if the query fails for an unknown reason.
*/
async function getById(ctx) {
  const id = ctx.params.id;
  const result = await comments.getById(id);
  if (result.length) {
    ctx.body = result[0];
  }
}

// Endpoint to RETRIVE comment by ID
router.get('/:id([0-9]{1,})', getById);
// Endpoint to DELETE comment by ID
router.del('/:id([0-9]{1,})', auth, deleteById);

module.exports = router;