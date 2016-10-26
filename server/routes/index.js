(() => {
  'use strict';

  let express = require('express'),
    router = express.Router();

  // The following routes now require a token to be accessed
  router.use('/api', require('./roles'));
  router.use('/api', require('./users'));
  router.use('/api', require('./documents'));

  module.exports = router;

})();
