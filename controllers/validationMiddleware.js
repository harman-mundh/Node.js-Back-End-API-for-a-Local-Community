 /**
 * A module to run JSON Schema-based validation on request/response data.
 * @module controllers/validationMiddleware
 * @author Harman Singh
 * @see schemas/* for JSON Schema definition files
 */

const {Validator, ValidationError} = require('jsonschema');

const articleSchema = require('../schemas/article.json').definitions.article;
const categorySchema = require('../schemas/category.json').definitions.category;
const commentSchema = require('../schemas/comment.json').definitions.comment;
const userSchema = require('../schemas/user.json').definitions.user;
const userUpdateSchema = require('../schemas/user.json').definitions.userUpdate;

/**
 * Wrapper that returns a Koa middleware handler function that validates
 * the request body against a given JSON schema definition.
 *
 * @param {object} schema - The JSON schema definition of the resource.
 * @param {string} resource - The name of the resource, e.g. 'issue'.
 * @returns {function} - A Koa middleware handler function that takes (ctx, next) params.
 */
const makeKoaValidator = (schema, resource) => {
  const v = new Validator();
  const validationOptions = {
    throwError: true,
    propertyName: resource
  };

  /**
   * Koa middleware handler function that validates the request body against
   * the given JSON schema.
   *
   * @param {object} ctx - The Koa request/response context object.
   * @param {function} next - The Koa next callback.
   * @throws {ValidationError} - A JSON Schema validation error.
   */
  const handler = async (ctx, next) => {
    const body = ctx.request.body;

    try {
      v.validate(body, schema, validationOptions);
      await next();
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(error);
        ctx.status = 400;
        ctx.body = error;
      } else {
        throw error;
      }
    }
  }

  return handler;
}

/** Validate data against the article schema. */
exports.validateArticle = makeKoaValidator(articleSchema, 'article');
/** Validate data against the category schema. */
exports.validateCategory = makeKoaValidator(categorySchema, 'category');
/** Validate data against the comment schema. */
exports.validateComment = makeKoaValidator(commentSchema, 'comment');
/** Validate data against the user schema for creating new users. */
exports.validateUser = makeKoaValidator(userSchema, 'user');
/** Validate data against the user schema for updating existing users. */
exports.validateUserUpdate = makeKoaValidator(userUpdateSchema, 'userUpdate');
