(() => {
  'use strict';

  let jwt = require('jsonwebtoken'),
    extractUserFromToken = require('./utils'),
    Documents = require('../models/documents'),
    Roles = require('../models/roles');

  module.exports = {
    create: (req, res, next) => {
      // check header or post parameters for token
      let token = req.body.token || req.headers['x-access-token'];
      let role;

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
            // Get the role from the request body
            // Or assign the default role
            if (req.body.role) {
              role = req.body.role.trim();
            } else {
              role = Roles.schema.paths.title.default();
            }

            // Find the corresponding role in the DB
            Roles.findOne({
                title: role
              })
              .exec((err, fetchedRole) => {
                if (err || !fetchedRole) {
                  return next(err);
                } else {
                  // If the document does not exist, create it
                  Documents.create({
                    title: req.body.title,
                    content: req.body.content,
                    ownerId: decodedUser.payload._id,
                    role: fetchedRole
                  }, (error, newDocument) => {
                    if (!error) {
                      res.status(201).json(newDocument);
                    }
                  });
                }
              });
          }
        });
      }
    },

    docsAuthenticate: (req, res, next) => {
      // Extract the user info from the token
      let token = req.body.token || req.headers['x-access-token'];
      let user = extractUserFromToken(token);
      // Validate whether a user can access a specific document
      Documents.findById(req.params.id)
        .populate('role')
        .exec((err, doc) => {
          if (err) {
            return next(err);
          } else {
            // If the user is the doc owner, allow access
            if (user._id === doc.ownerId) {
              next();
            } else if (doc.role === undefined) {
              return next(new Error('The document does not specify a role'));
            } else if (user.role.accessLevel >= doc.role.accessLevel) {
              // If the user's accessLevel is equal or higher to the one
              // specified by the doc, allow access
              next();
            } else {
              return res.status(403).json({
                error: 'You are not allowed to access this document'
              });
            }
          }
        });
    },

    ownerAuthenticate: (req, res, next) => {
      // Extract the user info from the token
      let token = req.body.token || req.headers['x-access-token'];
      let user = extractUserFromToken(token);
      // Validate whether a user can delete a specific document
      Documents.findById(req.params.id)
        .populate('role')
        .exec((err, doc) => {
          if (err) {
            return next(err);
          } else {
            // If the user is the doc owner, allow access
            if (user._id == doc.ownerId) {
              next();
            } else if (doc.role === undefined) {
              return next(new Error('The document does not specify a role'));
            } else if (user.role.accessLevel === 2) {
              // If the user is an admin, allow access
              next();
            } else {
              return res.status(403).json({
                error: 'You are not allowed to delete this document'
              });
            }
          }
        });
    },

    update: (req, res, next) => {
      Documents.findByIdAndUpdate(req.params.id, {
          $set: req.body
        },
        // Return the newly updated doc rather than the original
        {
          new: true
        })
        .populate('ownerId')
        .exec((err, document) => {
          if (!document) {
            return next(err);
          }
          res.send(document);
        });
    },

    get: (req, res, next) => {
      Documents.findById(req.params.id)
        .populate('roles')
        .exec((err, document) => {
          if (err || !document) {
            return next(err);
          } else {
            res.send(document);
          }
        });
    },

    delete: (req, res, next) => {
      Documents.findOneAndRemove({
        _id: req.params.id
      }, function(err, doc) {
        if (err || !doc) {
          return next(err);
        }
        res.sendStatus(204);
      });
    },

    all: (req, res, next) => {
      // Extract the user info from the token
      let token = req.body.token || req.headers['x-access-token'];
      let user = extractUserFromToken(token);
      // Set a default limit of 10 if one is not set
      let limit = parseInt(req.query.limit) || 10;
      Documents.find({})
        .limit(limit)
        .populate('role')
        .populate('ownerId')
        .sort('-dateCreated')
        .exec((err, docs) => {
          if (err) {
            return next(err);
          }
          // Return docs with accessLevel lower or equal to user's access level
          res.json(docs.filter(function(doc) {
            return doc.role.accessLevel <= user.role.accessLevel;
          }));
        });
    },

    allByRole: (req, res, next) => {
      // Extract the user info from the token
      let token = req.body.token || req.headers['x-access-token'];
      let user = extractUserFromToken(token);

      let limit = parseInt(req.query.limit) || 10;
      Roles.findOne({
        title: req.params.role
      }).exec((err, role) => {
        Documents.find({
            'role': role
          })
          .populate('role')
          .limit(limit)
          .sort('-dateCreated')
          .exec((err, docs) => {
            if (err) {
              return next(err);
            }
            res.json(docs.filter(function(doc) {
              return doc.role.accessLevel <= user.role.accessLevel;
            }));
          });
      });
    },

    allByDate: (req, res, next) => {
      // Extract the user info from the token
      let token = req.body.token || req.headers['x-access-token'];
      let user = extractUserFromToken(token);

      let limit = parseInt(req.query.limit) || 10;
      // Ensure the date format is in the format expected
      let dateRegex = /\d{4}\-\d{1,2}\-\d{1,2}$/;
      // If the regex does not match, throw an error
      if (!(dateRegex.test(req.params.date))) {
        let dateError = new Error('Date must be in the format YYYY-MM-DD');
        dateError.status = 400;
        return next(dateError);
      }
      // Get the date provided as a Date object
      let date = new Date(req.params.date);
      // Save the date in a temp variable since the date object is mutable
      let tmp = new Date(req.params.date);
      // Save the next day in a nextDate variable
      // Modifies the tmp variable instead of the date variable
      let nextDate = new Date(tmp.setDate(tmp.getDate() + 1));
      Documents.find()
        // Date is greater than the date provided and less than one day ahead
        // i.e. documents created today
        .where('dateCreated').gte(date).lt(nextDate)
        .populate('role')
        .limit(limit)
        .exec((err, docs) => {
          if (err) {
            return next(err);
          }
          res.json(docs.filter(function(doc) {
            return doc.role.accessLevel <= user.role.accessLevel;
          }));
        });
    }

  };
})();
