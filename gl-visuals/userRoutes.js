'use strict';
module.exports = function(app) {
  var users = require('../controllers/userController');

  // todoList Routes
  app.route('/users')
    .get(users.list_users)
    .post(users.create_user);

  app.route('/users/:userId')
    .get(users.read_user)
    .put(users.update_user)
    .delete(users.delete_user);
};
