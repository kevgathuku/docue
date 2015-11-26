(() => {
  'use strict';

  var Users = require('../controllers/users');

  var express = require('express'),
    router = express.Router();

  router.route('/users')
    .post(Users.create)
    .get(Users.all);

  module.exports = router;
})();
