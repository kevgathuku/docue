(() => {
  'use strict';

  let express = require('express'),
    Documents = require('../controllers/documents'),
    Users = require('../controllers/users'),
    router = express.Router();

  router.route('/documents')
    .post(Users.authenticate, Documents.create)
    .get(Users.authenticate, Documents.all);

  router.get('/documents/roles/:role', Documents.allByRole);

  router.route('/documents/:id')
    .get(Users.authenticate, Documents.get)
    .put(Users.authenticate, Documents.update)
    .delete(Users.authenticate, Documents.delete);

  module.exports = router;
})();
