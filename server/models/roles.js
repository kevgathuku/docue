(() => {
  'use strict';

  let mongoose = require('../config/db');

  let RoleSchema = mongoose.Schema({
    title: {
      type: String,
      unique: true,
      required: true,
      default: 'viewer',
      enum: ['admin', 'staff', 'viewer']
    }
  });

  module.exports = mongoose.model('Role', RoleSchema);
})();
