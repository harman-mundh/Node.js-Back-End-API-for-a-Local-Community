/**
 * A module to set permission on user and admin and actions 
 * that each role can perfom on route users
 * 
 * @module permissions/users
 * @author Harman Singh
 */

const AccessControl = require('role-acl');
const ac = new AccessControl();

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}}) 
  .execute('read')                                          
  .on('user', ['*', '!password', '!passwordSalt']);        

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .execute('update')
  .on('user', ['firstName', 'lastName', 'about', 'password', 'email', 'avatarURL']);

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}}) 
  .execute('delete')                                          
  .on('user');

ac
  .grant('admin')
  .execute('read')
  .on('user');

ac
  .grant('admin')
  .execute('read')
  .on('users');

ac
  .grant('admin')
  .execute('update')
  .on('user');

ac
  .grant('admin')
  .condition({Fn:'NOT_EQUALS', args: {'requester':'$.owner'}})
  .execute('delete')
  .on('user');

exports.readAll = (requester) => { 
  
  return ac
    .can(requester.role) 
    .execute('read')  
    .sync()
    .on('users'); 
  }

exports.read = (requester, data) => {

  return ac
    .can(requester.role) 
    .context({requester:requester.ID, owner:data.ID}) 
    .execute('read') 
    .sync()
    .on('user');
  }

exports.update = (requester, data) => {

  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.ID})
    .execute('update')
    .sync()
    .on('user');
  }

exports.delete = (requester, data) => {

  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.ID})
    .execute('delete')
    .sync()
    .on('user');
  }