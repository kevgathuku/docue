(() => {
  'use strict';

  let jwt = require('jsonwebtoken');
  let Documents = require('../models/documents');
  let Roles = require('../models/roles');

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

    update: (req, res, next) => {
      Documents.findByIdAndUpdate(req.params.id, {
          $set: req.body
        },
        // Return the newly updated doc rather than the original
        {
          new: true
        }, (err, document) => {
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

    allByRole: (req, res, next) => {
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
            res.json(docs);
          });
      });
    },

    allByDate: (req, res, next) => {
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
        .limit(limit)
        .exec((err, docs) => {
          if (err) {
            return next(err);
          }
          res.json(docs);
        });
    }

  };
})();
