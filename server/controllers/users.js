(() => {
  'use strict';

  let jwt = require('jsonwebtoken'),
    extractUserFromToken = require('./utils'),
    Documents = require('../models/documents'),
    Users = require('../models/users'),
    Roles = require('../models/roles');

  module.exports = {
    create: (req, res, next) => {
      if (!req.body.username || !req.body.firstname ||
        !req.body.lastname || !req.body.email || !req.body.password) {
        let err = new Error(
          'Please provide the username, firstname, ' +
          'lastname, email, and password values'
        );
        err.status = 400;
        return next(err);
      } else if (!req.body.role) {
        // Set the role field to the default value if not provided
        req.body.role = Roles.schema.paths.title.default();
      }
      // Check if the user already exists
      Users.findOne().or([{
        username: req.body.username
      }, {
        email: req.body.email
      }]).exec((err, user) => {
        if (err) {
          return next(err);
        }
        if (user) {
          // The user already exists
          let error = new Error('The User already exists');
          error.status = 400;
          return next(error);
        } else {
          Roles.findOne({
            title: req.body.role
          }, (err, role) => {
            if (err) {
              return next(err);
            } else {
              // Create the user with the role specified
              Users.create({
                username: req.body.username,
                name: {
                  first: req.body.firstname,
                  last: req.body.lastname
                },
                email: req.body.email,
                password: req.body.password,
                role: role._id
              }, (error, newUser) => {
                if (error) {
                  return next(error);
                } else {
                  // Return the newly created user
                  res.status(201).json(newUser);
                }
              });
            }
          });
        }
      });
    },

    get: (req, res, next) => {
      // Don't send back the password field
      Users.findById(req.params.id, '_id name username email role loggedIn')
        .populate('role')
        .exec((err, user) => {
          if (err) {
            return next(err);
          } else {
            res.json(user);
          }
        });
    },

    update: (req, res, next) => {
      // A user can only update their own profile
      if (req.decoded._id !== req.params.id) {
        return res.status(401).json({
          error: 'Unauthorized Access'
        });
      }
      // Set the name fields in the format expected by the model
      if (req.body.hasOwnProperty('firstname') || req.body.hasOwnProperty('lastname')) {
        req.body.name = {
          first: req.body.firstname,
          last: req.body.lastname
        };
      }
      Users.findByIdAndUpdate(req.params.id, {
          $set: req.body
        },
        // Return the updated user object
        {
          new: true
        }, (err, user) => {
          if (!user) {
            return next(err);
          }
          res.send(user);
        });
    },

    delete: (req, res, next) => {
      // A user can only delete their own profile
      // An admin can also delete a user
      if (req.decoded._id !== req.params.id || req.decoded.role.title === 'admin') {
        return res.status(401).json({
          error: 'Unauthorized Access'
        });
      }

      Users.findOneAndRemove({
        _id: req.params.id
      }, function(err, user) {
        if (err) {
          return next(err);
        } else if (!user) {
          return next(err);
        }
        res.sendStatus(204);
      });
    },

    // Get all documents created by this user
    getDocs: (req, res) => {
      Documents.find()
        .where({
          ownerId: req.params.id
        }).exec((err, docs) => {
          if (err) {
            return res.status(500).json({
              error: err.message
            });
          } else {
            res.json(docs);
          }
        });
    },

    all: (req, res) => {
      // This action is available to admin roles only
      if (req.decoded.role.title !== 'admin') {
        return res.status(401).json({
          error: 'Unauthorized Access'
        });
      }
      Users.find((err, users) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        } else {
          res.json(users);
        }
      });
    },

    login: (req, res, next) => {
      // Find the user and set the loggedIn flag to true
      Users.findOneAndUpdate({
            username: req.body.username
          }, {
            $set: {
              loggedIn: true
            }
          }, // Return the updated user object
          {
            new: true
          })
        .populate('role')
        .exec((err, user) => {
          if (err) {
            return next(err);
          } else if (!user) {
            res.status(404).json({
              error: 'User not found.'
            });
          } else if (user.password != req.body.password) {
            res.status(401).json({
              error: 'Authentication failed. Wrong password.'
            });
          } else {
            // User is found and password is correct
            // Sign the user object with the app secret
            let token = jwt.sign(user, req.app.get('superSecret'), {
              expiresIn: 86400 // expires in 24 hours
            });
            res.json({
              user: user,
              token: token
            });
          }
        });
    },

    logout: (req, res, next) => {
      // Set the loggedIn flag for the user to false
      let token = req.body.token || req.headers['x-access-token'];
      let user = extractUserFromToken(token);
      Users.findByIdAndUpdate(user._id, {
          loggedIn: false
        })
        .exec((err, user) => {
          if (err) {
            return next(err);
          } else if (!user) {
            res.status(404).json({
              error: 'User not found.'
            });
          } else {
            res.json({
              message: 'Successfully logged out'
            });
          }
        });
    },

    // route middleware to verify a token
    authenticate: (req, res, next) => {
      // check header or post parameters for token
      let token = req.body.token || req.headers['x-access-token'];

      // decode token
      if (token) {
        // Check if the user is logged in
        let user = extractUserFromToken(token);
        if (!user.loggedIn) {
          return res.status(401).json({
            error: 'Unauthorized Access. Please login first'
          });
        }
        // verifies secret and checks expiry time
        jwt.verify(token, req.app.get('superSecret'), (err, decoded) => {
          if (err) {
            return res.status(401).json({
              error: 'Failed to authenticate token.'
            });
          } else {
            // if everything is good, save to request for use in other routes
            decoded.password = null;
            req.decoded = decoded;
            next();
          }
        });
      } else {
        // if there is no token return an error
        return res.status(403).send({
          error: 'No token provided.'
        });
      }
    }

  };
})();
