(() => {
  'use strict';

  let mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/dms');

  let db = mongoose.connection;

  db.on('error', console.error.bind(console, 'Connection Error : '));
  db.once('open', function() {
    console.log('Connection ok!');
  });

  module.exports = mongoose;

})();
