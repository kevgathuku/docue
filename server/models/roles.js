(function() {
  'use strict';

  let mongoose = require('../config/db');

  let RoleSchema = mongoose.Schema({
    title: {
      type: String,
      unique: true,
      required: true
    }
  });

  module.exports = mongoose.model('Role', RoleSchema);
})();
