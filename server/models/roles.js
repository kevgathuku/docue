(() => {
  'use strict';

  let mongoose = require('../config/db');

  let RoleSchema = mongoose.Schema({
    title: {
      type: String,
      unique: true,
      required: true,
      default: 'user',
      enum: ['admin', 'staff', 'user']
    }
  });

  module.exports = mongoose.model('Role', RoleSchema);
})();
