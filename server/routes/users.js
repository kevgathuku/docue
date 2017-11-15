'use strict';

const Users = require('../controllers/users');

const express = require('express'),
  router = express.Router();

router
  .route('/users/')
  .post(Users.create)
  .get(Users.authenticate, Users.all);

// Route to get whether a user is logged in or Not
router.get('/users/session', Users.getSession);

router
  .route('/users/:id')
  .get(Users.authenticate, Users.get)
  .put(Users.authenticate, Users.update)
  .delete(Users.authenticate, Users.delete);

router.route('/users/:id/documents').get(Users.authenticate, Users.getDocs);

router.post('/users/login', Users.login);
router.post('/users/logout', Users.logout);

module.exports = router;
