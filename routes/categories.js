/**
 * KOA router module for managing resources related to issues resources with HTTP methods.
 * 
 * @module issueRoutes
 * @author Harman Singh
 * @requires koa,koa-bodyparser
 * @requires permissions/issues
 * @requires models/{issues, issuesViews, issueCatergories, commets, likes} 
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const model = require('../models/categories');
const auth = require('../controllers/authMiddleware');
const {validateCategory} = require('../controllers/validationMiddleware'); 

const Prefix = '/api/v1/categories'; 
const router = Router({prefix: Prefix});

router.get('/', getAll);
router.post('/', auth, bodyParser(), validateCategory, createCategory);
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', auth, bodyParser(), validateCategory, updateCategory);
router.del('/:id([0-9]{1,})', auth, deleteCategory);

// TODO: validation
// TODO: error handling

/**
 * Get all categories.
 * @param {Object} ctx - Koa context object
 */
async function getAll(ctx) {
  const result = await model.getAll();
  ctx.body = result;
}

/**
 * Get a category by its ID.
 * @param {Object} ctx - Koa context object
 */
async function getById(ctx) {
  const id = ctx.params.id;
  const result = await model.getById(id);
  const category = result[0];
  ctx.body = category;
}

/**
 * Create a new category.
 * @param {Object} ctx - Koa context object
 */
async function createCategory(ctx) {
  const body = ctx.request.body;
  const result = await model.add(body);
  const id = result.insertId;
  ctx.status = 201;
  ctx.body = {ID: id, created: true, link: `${ctx.request.path}/${id}`};
}

/**
 * Update an existing category by its ID.
 * @param {Object} ctx - Koa context object
 */
async function updateCategory(ctx) {
  const id = ctx.params.id;
  let result = await model.getById(id);  // get existing record
  let category = result[0];
  // exclude id field that should not be updated
  const {ID, ...body} = ctx.request.body;
  // overwrite other fields with remaining body data
  Object.assign(category, body);
  await model.update(category);
  ctx.body = {ID: id, updated: true, link: ctx.request.path};
}

/**
 * Delete a category by its ID.
 * @param {Object} ctx - Koa context object
 */
async function deleteCategory(ctx) {
  const id = ctx.params.id;
  await model.delById(id);
  ctx.body = {ID: id, deleted: true}
}

module.exports = router;
