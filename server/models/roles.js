(() => {
  'use strict';

  let mongoose = require('../config/db');

  let RoleSchema = mongoose.Schema({
    title: {
      type: String,
      unique: true,
      required: true,
      default: 'viewer',
      enum: ['viewer', 'admin', 'staff']
    },
    // The accessLevel will be used to check for permissions
    accessLevel: {
      type: Number,
      enum: [0, 1, 2]
    }
  });

  module.exports = mongoose.model('Role', RoleSchema);
})();
