(function() {
  'use strict';

  let mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/dms');

  module.exports = mongoose;

})();
