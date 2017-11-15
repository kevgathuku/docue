'use strict';

const express = require('express'),
  Documents = require('../controllers/documents'),
  Users = require('../controllers/users'),
  router = express.Router();

router
  .route('/documents')
  .post(Users.authenticate, Documents.create)
  .get(Users.authenticate, Documents.all);

router
  .route('/documents/:id')
  .get(Documents.docsAuthenticate, Users.authenticate, Documents.get)
  .put(Documents.docsAuthenticate, Users.authenticate, Documents.update)
  .delete(Documents.ownerAuthenticate, Users.authenticate, Documents.delete);

router.get('/documents/created/:date', Documents.allByDate);

router.get('/documents/roles/:role', Documents.allByRole);

module.exports = router;
