/**
 * A module to set permission on user and admin and actions 
 * that each role can perfom for route issues
 * 
 * @module permissions/users
 * @author Harman Singh
 */

const AccessControl = require('role-acl');
const ac = new AccessControl();

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .execute('update')
  .on('issues');

  ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}}) 
  .execute('delete')                                          
  .on('issues');

ac
  .grant('admin')
  .execute('delete')
  .on('issues');

ac 
  .grant('admin')
  .execute('update')
  .on('issues')

exports.update = (requester, data) => {

  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.authorID})
    .execute('update')
    .sync()
    .on('issues');
  }

exports.delete = (requester, data) => {

  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.authorID})
    .execute('delete')
    .sync()
    .on('issues');
  }