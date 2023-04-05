const AccessControl = require('role-acl');
const ac = new AccessControl();

// controls for specific CRUD operations on announcement records
// don't let users create or update any resources related to 

// permissions for role 'user'
ac
  .grant('user')
  .execute('read')
  .on('announcements');

// permission of role 'admin
ac
  .grant('admin')
  .execute('create')
  .on('announcements');

  ac
  .grant('admin')
  .execute('read')
  .on('announcements');

  ac
  .grant('admin')
  .execute('update')
  .on('announcements');

  ac
  .grant('admin')
  .execute('delete')
  .on('announcements');

exports.create = (requester) => {
return ac
    .can(requester.role)
    .execute('create')
    .sync()
    .on('announcements');
}

exports.read = (requester) => {
    return ac
      .can(requester.role)
      .execute('read')
      .sync()
      .on('announcements');
  }

exports.update = (requester) => {
return ac
    .can(requester.role)
    .execute('update')
    .sync()
    .on('announcements');
}

exports.delete = (requester) => {
return ac
    .can(requester.role)
    .execute('delete')
    .sync()
    .on('announcements');
}
