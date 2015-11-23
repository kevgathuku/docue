(function() {
  'use strict';

  let mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/dms');

  let RoleSchema = mongoose.Schema({
    'title': {
      type: String,
      required: true,
      unique: true
    }
  });

  module.exports = mongoose.model('Role', RoleSchema);
})();
