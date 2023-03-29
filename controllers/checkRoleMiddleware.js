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
exports.checkRole = async function checkRole(ctx, next) {
    const userID = ctx.state.user.ID;
    const issueID = ctx.params.id;
    const result = await ctx.app.context.db.query('SELECT authorID FROM issues WHERE ID=?', [issueID]);

    if (!result || (result.authorID !== userID && ctx.state.user.role !== 'admin')) {
        ctx.status = 403;
    }

    await next();
};