/*eslint no-console: 0*/
(() => {
  'use strict';

  let mongoose = require('mongoose');
  // MONGOLAB_URI is the MongoDB url config in Heroku
  mongoose.connect(process.env.MONGO_TEST_URL || process.env.MONGODB_URL || process.env.MONGOLAB_URI);

  let db = mongoose.connection;

  db.on('error', console.error.bind(console, 'Connection Error : '));
  db.once('open', () => {
    console.log('Connection ok!');
  });

  module.exports = mongoose;

})();
