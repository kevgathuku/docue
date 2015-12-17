(() => {
  'use strict';

  let jwt = require('jsonwebtoken');
  let Documents = require('../models/documents');
  let Roles = require('../models/roles');

  let notFoundError = new Error('Not Found');
  notFoundError.status = 404;

  module.exports = {
    create: (req, res, next) => {
      // check header or post parameters for token
      let token = req.body.token || req.headers['x-access-token'];

      if (!req.body.title || req.body.title.trim === '') {
        let err = new Error(
          'The document title is required'
        );
        err.status = 400;
        return next(err);
      } else {
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
            let decodedUser = jwt.decode(token, {
              complete: true
            });
            // Get the passed in roles as an array
            // If no roles have been provided, assign the default role
            var decodedRoles;
            if (req.body.roles) {
              decodedRoles = req.body.roles.trim().replace(/\s/g, '')
                .split(',');
            } else {
              decodedRoles = [
                Roles.schema.paths.title.default()
              ];
            }
            // Convert the roles into an array of the form:
            // [{title: 'Role1'}, {title: 'Role2'}]
            // in preparation for passing them to the 'or' query
            let mappedRoles = decodedRoles.map((role) => {
              return {
                title: role
              };
            });
            Roles.find().or(mappedRoles)
              .exec((err, roles) => {
                // If the document does not exist, create it
                Documents.create({
                  title: req.body.title,
                  content: req.body.content,
                  ownerId: decodedUser.payload._id,
                  roles: roles
                }, (error, newDocument) => {
                  if (!error) {
                    res.status(201).json(newDocument);
                  }
                });
              });
          }
        });
      }
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
      Documents.findById(req.params.id)
        .populate('roles')
        .exec((err, document) => {
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
      let limit = parseInt(req.query.limit) || 10;
      Documents.find({})
        .limit(limit)
        .sort('-dateCreated')
        .exec((err, docs) => {
          if (err) {
            return next(err);
          }
          res.json(docs);
        });
    },

    allByRole: (req, res) => {
      let limit = parseInt(req.query.limit) || 10;
      Roles.findOne({
        title: req.params.role
      }).exec((err, role) => {
        Documents.find({
            'roles': role
          })
          .populate('roles')
          .limit(limit)
          .sort('-dateCreated')
          .exec((err, docs) => {
            if (err) {
              return next(err);
            }
            res.json(docs);
          });
      });
    }

  };
})();
