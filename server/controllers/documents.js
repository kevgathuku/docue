(() => {
  'use strict';

  let jwt = require('jsonwebtoken');
  let Documents = require('../models/documents');

  module.exports = {
    create: (req, res) => {
      // check header or post parameters for token
      let token = req.body.token || req.headers['x-access-token'];

      // Find if the document already exists
      Documents.findOne({
        title: req.body.title
      }, (err, document) => {
        if (document) {
          // If the document already exists send a validation error
          res.status(400).json({
            error: 'Document already exists'
          });
        } else {
          // Decode the user info from the token
          let decoded = jwt.decode(token, {
            complete: true
          });
          // If the document does not exist, create it
          Documents.create({
            title: req.body.title,
            content: req.body.content,
            ownerId: decoded.payload._id
          }, (error, newDocument) => {
            if (!error) {
              res.status(201).json(newDocument);
            }
          });
        }
      });
    },

    all: (req, res) => {
      Documents.find({})
        .sort('-dateCreated')
        .exec((err, docs) => {
          res.json(docs);
        });
    },

  };
})();
