/**
 * A module to set permission on user and admin and actions 
 * that each role can perfom on route meetings
 * 
 * @module permissions/users
 * @author Harman Singh
 */

const AccessControl = require('role-acl');
const ac = new AccessControl();

// controls for specific CRUD operations on meetings records
// don't let users update the meeting ID or the authorID

// permissions for role 'user'

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .  execute('update')
  .on('meeting');

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .execute('delete')
  .on('meeting');

// permission of role 'admin

  ac
  .grant('admin')
  .execute('update')
  .on('meeting');

  ac
  .grant('admin')
  .execute('delete')
  .on('meeting');

exports.update = (requester, data) => {

  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.authorID})
    .execute('update')
    .sync()
    .on('meeting');
  }

exports.delete = (requester, data) => {

  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.authorID})
    .execute('delete')
    .sync()
    .on('meeting');
  }