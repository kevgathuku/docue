(() => {
  'use strict';

  let Users = require('../controllers/users');

  let express = require('express'),
    router = express.Router();

  router.route('/users')
    .post(Users.create)
    .get(Users.authenticate, Users.all);

  router.route('/users/:id')
    .get(Users.authenticate, Users.get);

  router.route('/users/:id/documents')
    .get(Users.authenticate, Users.getDocs);

  router.route('/users/login')
    .post(Users.login);

  module.exports = router;
})();
