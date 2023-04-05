const AccessControl = require('role-acl');
const ac = new AccessControl();

// controls for specific CRUD operations on meetings records
// don't let users update the meeting ID or the authorID

// permissions for role 'user'
ac
  .grant('user')
  .execute('read')
  .on('meetings');

ac
  .grant('user')
  .execute('read')
  .on('meetings');

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .  execute('update')
  .on('meetings');

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .execute('update')
  .on('meetings');

// permission of role 'admin
ac
  .grant('admin')
  .execute('create')
  .on('meetings');

  ac
  .grant('admin')
  .execute('read')
  .on('meetings');

  ac
  .grant('admin')
  .execute('update')
  .on('meetings');

  ac
  .grant('admin')
  .execute('delete')
  .on('meetings');

exports.create = (requester) => {
return ac
    .can(requester.role)
    .execute('create')
    .sync()
    .on('meetings');
}

exports.read = (requester) => {
    return ac
        .can(requester.role)
        .execute('read')
        .sync()
        .on('meetings');
    }

exports.update = (requester, data) => {
    console.log(requester)
    console.log(data)
  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.authorID})
    .execute('update')
    .sync()
    .on('meetings');
}

exports.delete = (requester, data) => {
    console.log(requester)
    console.log(data)
  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.authorID})
    .execute('delete')
    .sync()
    .on('meetings');
}