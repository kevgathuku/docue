'use strict';

const express = require('express'),
  Roles = require('../controllers/roles'),
  Users = require('../controllers/users'),
  router = express.Router();

router
  .route('/roles')
  .post(Users.authenticate, Roles.create)
  .get(Users.authenticate, Roles.all);

module.exports = router;
