(() => {
  'use strict';

  let express = require('express'),
    router = express.Router();

  /* Delegate all unregistered routes to the frontend. */
  router.get('*', function(req, res) {
    res.sendFile('index.html', {
      root: './public/'
    });
  });

  // The following routes now require a token to be accessed
  router.use('/api', require('./roles'));
  router.use('/api', require('./users'));
  router.use('/api', require('./documents'));

  module.exports = router;

})();
