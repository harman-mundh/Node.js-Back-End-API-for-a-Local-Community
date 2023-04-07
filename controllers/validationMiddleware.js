 /**
 * A module to run JSON Schema-based validation on request/response data.
 * @module controllers/validationMiddleware
 * @author Harman Singh
 * @see schemas/* for JSON Schema definition files
 */

const {Validator, ValidationError} = require('jsonschema');

const issueSchema = require('../schemas/issue.json').definitions.issue;
const issueUpdateSchema = require('../schemas/issue.json').definitions.issueUpdate;
const categorySchema = require('../schemas/category.json').definitions.category;
const categoryUpdateSchema = require('../schemas/category.json').definitions.categoryUpdate;
const commentSchema = require('../schemas/comment.json').definitions.comment;
const userSchema = require('../schemas/user.json').definitions.user;
const userUpdateSchema = require('../schemas/user.json').definitions.userUpdate;
const announcementSchema = require('../schemas/announcement.json').definitions.announcement;
const announcementUpdateSchema =  require('../schemas/announcement.json').definitions.announcementUpdate;
const meetingSchema = require('../schemas/meeting.json').definitions.meeting;
const meetingUpdateSchema = require('../schemas/meeting.json').definitions.meetingUpdate;
const locationsSchema = require('../schemas/location.json').definitions.location;
const locationUpdateSchema = require('../schemas/location.json').definitions.locationUpdate;

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

/** Validate data against the issue schema. */
exports.validateIssue = makeKoaValidator(issueSchema, 'issue');
/** Validate data against the issue schema for updating existing posts. */
exports.validateIssueUpdate = makeKoaValidator(issueUpdateSchema, 'issueUpdate');
/** Validate data against the category schema. */
exports.validateCategory = makeKoaValidator(categorySchema, 'category');
/** Validate data against the category schema for updating existing category. */
exports.validateCategoryUpdate = makeKoaValidator(categoryUpdateSchema, 'categoryUpdate');
/** Validate data against the comment schema. */
exports.validateComment = makeKoaValidator(commentSchema, 'comment');
/** Validate data against the user schema for creating new users. */
exports.validateUser = makeKoaValidator(userSchema, 'user');
/** Validate data against the user schema for updating existing users. */
exports.validateUserUpdate = makeKoaValidator(userUpdateSchema, 'userUpdate');
/** Validate data against the announcement schema. */
exports.validateAnnoucement = makeKoaValidator(announcementSchema, 'annoucement');
/** Validate data against the announcement schema for updating existing announcement. */
exports.validateAnnoucementUpdate = makeKoaValidator(announcementUpdateSchema, 'announcementUpdate');
/** Validate data against the meeting schema. */
exports.validateMeeting = makeKoaValidator(meetingSchema, 'meeting');
/** Validate data against the meeting schema for updating existing meeting. */
exports.validateMeetingUpdate = makeKoaValidator(meetingUpdateSchema, 'meetingUpdate');
/** Validate data against the location schema related to the meeting. */
exports.validateLocation = makeKoaValidator(locationsSchema, 'location');
/** Validate data against the location schema for updating existing locations data. */
exports.validateLocationUpdate = makeKoaValidator(locationUpdateSchema, 'locationUpdate');
