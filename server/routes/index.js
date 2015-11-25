(() => {
  'use strict';

  var express = require('express'),
    router = express.Router();

  router.use('/api', require('./users'));

  module.exports = router;

})();
