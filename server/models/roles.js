'use strict';

const mongoose = require('../config/db');

const ACCESS_LEVEL = {
  viewer: 0,
  staff: 1,
  admin: 2
};

const DEFAULT_ROLE = 'viewer';
const DEFAULT_ACCESS_LEVEL = ACCESS_LEVEL[DEFAULT_ROLE];

const RoleSchema = mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
    default: DEFAULT_ROLE,
    enum: Object.keys(ACCESS_LEVEL)
  },
  // The accessLevel will be used to check for permissions
  accessLevel: {
    type: Number,
    default: DEFAULT_ACCESS_LEVEL,
    enum: Object.keys(ACCESS_LEVEL).map(title => ACCESS_LEVEL[title])
  }
});

module.exports = mongoose.model('Role', RoleSchema);
module.exports.ACCESS_LEVEL = Object.freeze(ACCESS_LEVEL);
