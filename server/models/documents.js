'use strict';

const mongoose = require('../config/db');

const DocumentSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      required: true
    },
    content: {
      type: String
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }
  },
  {
    timestamps: {
      createdAt: 'dateCreated',
      updatedAt: 'lastModified'
    }
  }
);

module.exports = mongoose.model('Document', DocumentSchema);
