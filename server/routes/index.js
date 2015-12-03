(() => {
  'use strict';

  let express = require('express'),
    router = express.Router();

  // The following routes now require a token to be accessed
  router.use('/api', require('./roles'));
  router.use('/api', require('./users'));

  module.exports = router;

})();
