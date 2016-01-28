(() => {
  'use strict';

  let express = require('express'),
    router = express.Router();

  // The following routes now require a token to be accessed
  router.use('/api', require('./roles'));
  router.use('/api', require('./users'));
  router.use('/api', require('./documents'));

  // Delegate all unregistered routes to the frontend
  router.get('*', function(req, res) {
    res.sendFile('index.html', {
      root: './public/'
    });
  });

  module.exports = router;

})();
