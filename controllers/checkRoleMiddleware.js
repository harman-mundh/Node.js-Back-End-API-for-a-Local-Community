/**
 * Koa middleware for checking the role of current user, either owner or admiss access
 * 
 * @module checkRoleMiddleware
 * @author Harman Singh
 */

 const db = require('../helpers/database');

/**
 * Function to query the database for authorID related to issue post
 * 
 * @param {object} ctx - Koa contect object.
 * @param {Function} next - Koa next function
 * @throws {Error} 403 - Forbidden, the user is neither the owner or admin
 */

exports.requireRole = function requireRole(role, isOwner = false) {
    return async (ctx, next) => {
        const userID = ctx.state.user.ID;
    
        // Check if the user has the required role
        if (ctx.state.user.role === role) {
          await next();
        } else if (isOwner) {
          // If the owner is allowed, check if the user is the owner (author) of the resource
          const authorIDField = role === 'admin' ? 'authorID' : 'authorID';
          const tableName = ctx.path.includes('meetings') ? 'meetings' : 'issues';
          const resourceID = ctx.params.id;
          const result = await ctx.app.context.db.query(`SELECT ${authorIDField} FROM ${tableName} WHERE ID=?`, [resourceID]);
    
          if (result.length > 0 && result[0][authorIDField] === userID) {
            await next();
          } else {
            ctx.status = 403;
          }
        } else {
          ctx.status = 403;
        }
      };
    }

//requireRole('admin')
//requireRole('admin', true) value true if the user is the author of the post[issues and meeting]
