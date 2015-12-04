(() => {
  'use strict';

  let jwt = require('jsonwebtoken');
  let Documents = require('../models/documents');

  let notFoundError = new Error('Not Found');
  notFoundError.status = 404;

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

    update: (req, res, next) => {
      // Delete all fields from req.body other than title & content
      Object.keys(req.body).forEach(value => {
        if ((value !== 'title') && (value !== 'content')) {
          delete req.body[value];
        }
      });
      Documents.findByIdAndUpdate(req.params.id, {
          $set: req.body
        },
        // Return the newly edited doc rather than the original
        {
          new: true
        }, (err, document) => {
          if (!document) {
            return next(notFoundError);
          }
          res.send(document);
        });
    },

    get: (req, res, next) => {
      Documents.findById(req.params.id, (err, document) => {
        if (err) {
          return next(err);
        } else if (!document) {
          return next(notFoundError);
        } else {
          res.send(document);
        }
      });
    },

    delete: (req, res, next) => {
      Documents.findOneAndRemove({
        _id: req.params.id
      }, function(err, doc) {
        if (err) {
          return next(err);
        } else if (!doc) {
          return next(notFoundError);
        }
        res.sendStatus(204);
      });
    },

    all: (req, res) => {
      // Set a default limit of 10 if one is not set
      let limit = req.query.limit || 10;
      Documents.find({})
        .limit(limit)
        .sort('-dateCreated')
        .exec((err, docs) => {
          res.json(docs);
        });
    },

  };
})();
