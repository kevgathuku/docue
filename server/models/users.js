(function() {
  'use strict';

  let mongoose = require('../config/db');

  let UserSchema = mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    name: {
      first: {
        type: String,
        required: true,
        trim: true
      },
      last: {
        type: String,
        required: true,
        trim: true
      },
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      trim: true
    }
  });

  module.exports = mongoose.model('User', UserSchema);
})();
