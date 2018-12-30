'use strict';
module.exports = function(app) {

  var controller = require('./controller');

  // todoList Routes
  app.route('/test')
    .get(controller.test)
    .post(controller.test);

  // app.route('/users/:userId')
  //   .get(users.read_user)
  //   .put(users.update_user)
  //   .delete(users.delete_user);
};
