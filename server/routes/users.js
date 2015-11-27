(() => {
  'use strict';

  let Users = require('../controllers/users');

  let express = require('express'),
    router = express.Router();

  router.route('/users')
    .post(Users.create)
    .get(Users.all);

  router.route('/users/:id')
    .get(Users.authenticate, Users.get);

  router.route('/users/login')
    .post(Users.login);

  module.exports = router;
})();
