(() => {
  'use strict';

  var Roles = require('../controllers/roles');

  var express = require('express'),
    router = express.Router();

  router.route('/roles')
    .post(Roles.create)
    .get(Roles.all);

  module.exports = router;
})();
