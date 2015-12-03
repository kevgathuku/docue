(() => {
  'use strict';

  let express = require('express'),
    Documents = require('../controllers/documents'),
    Users = require('../controllers/users'),
    router = express.Router();

  router.route('/documents')
    .post(Users.authenticate, Documents.create)
    .get(Users.authenticate, Documents.all);

  module.exports = router;
})();
