/* @flow */
((): void => {
  'use strict';

  let jwt = require('jsonwebtoken'),
    extractUserFromToken = require('./utils').extractUserFromToken,
    Error = require('./utils').Error,
    Documents = require('../models/documents'),
    Users = require('../models/users'),
    Roles = require('../models/roles');

  module.exports = {
    create: (req, res, next): void => {
      let required: Array<string> = ['username', 'firstname', 'lastname', 'email',
        'password'
      ];
      // If all the required fields are not present, raise an error
      // Returns true only if all the required fields are found in req.body
      if (!required.every(field => field in req.body)) {
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
      }]).exec((err, user): void => {
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
          }, (err, role): void => {
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
                role: role,
                loggedIn: true
              }, (error, newUser): void => {
                if (error) {
                  return next(error);
                } else {
                  // Successful signup
                  let tokenUser = {
                    _id: newUser._id,
                    role: newUser.role,
                    loggedIn: newUser.loggedIn
                  };
                  // Sign the user object with the app secret
                  let token = jwt.sign(tokenUser, req.app.get(
                    'superSecret'), {
                    expiresIn: 86400 // expires in 24 hours
                  });
                  // Return the newly created user with the token included
                  res.status(201).json({
                    user: newUser,
                    token: token
                  });
                }
              });
            }
          });
        }
      });
    },

    get: (req, res, next): void => {
      // Only an admin or owner can view their own profile
      if (req.decoded._id === req.params.id || req.decoded.role.title ===
        'admin') {
        // Don't send back the password field
        Users.findById(req.params.id,
            '_id name username email role loggedIn')
          .populate('role')
          .exec((err, user): void => {
            if (err) {
              return next(err);
            } else {
              res.json(user);
            }
          });
      } else {
        return res.status(403).json({
          error: 'Unauthorized Access'
        });
      }
    },

    update: (req, res, next): void => {
      // A user can only update their own profile
      // An admin can edit any user's profile i.e. roles
      if (req.decoded._id === req.params.id || req.decoded.role.title ===
        'admin') {
        // Set the name fields in the format expected by the model
        if (req.body.hasOwnProperty('firstname') || req.body.hasOwnProperty(
            'lastname')) {
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
            })
          .populate('role')
          .exec((err, user): void => {
            if (!user) {
              return next(err);
            }
            res.send(user);
          });
      } else {
        return res.status(403).json({
          error: 'Unauthorized Access'
        });
      }
    },

    delete: (req, res, next): void => {
      // A user can only delete their own profile
      // An admin can also delete a user
      if (req.decoded._id === req.params.id || req.decoded.role.title ===
        'admin') {
        Users.findOneAndRemove({
          _id: req.params.id
        }, function(err, user): void {
          if (err || !user) {
            return next(err);
          }
          res.sendStatus(204);
        });
      } else {
        return res.status(403).json({
          error: 'Unauthorized Access'
        });
      }
    },

    // Get all documents created by this user
    getDocs: (req, res): void => {
      Documents.find()
        .where({
          ownerId: req.params.id
        }).exec((err, docs): void => {
          if (err) {
            res.next(err);
          } else {
            res.json(docs);
          }
        });
    },

    all: (req, res): void => {
      // This action is available to admin roles only
      if (req.decoded.role.title !== 'admin') {
        return res.status(403).json({
          error: 'Unauthorized Access'
        });
      }
      Users.find()
        .populate('role')
        .exec((err, users): void => {
          if (err) {
            res.next(err);
          } else {
            res.json(users);
          }
        });
    },

    login: (req, res, next): void => {
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
        .exec((err, user): void => {
          if (err) {
            return next(err);
          } else if (!user) {
            return res.status(404).json({
              error: 'Authentication failed. User Not Found.'
            });
          } else if (!user.comparePassword(req.body.password)) {
            // If the password provided is wrong.
            res.status(401).json({
              error: 'Authentication failed. Wrong password.'
            });
          } else {
            user.password = null;
            let tokenUser = {
              _id: user._id,
              role: user.role,
              loggedIn: user.loggedIn
            };
            // User is found and password is correct
            // Sign the user object with the app secret
            let token = jwt.sign(tokenUser, req.app.get('superSecret'), {
              expiresIn: 86400 // expires in 24 hours
            });
            res.json({
              user: user,
              token: token
            });
          }
        });
    },

    logout: (req, res, next): void => {
      // Set the loggedIn flag for the user to false
      let token = req.body.token || req.headers['x-access-token'];
      let user: Object = extractUserFromToken(token);
      Users.findByIdAndUpdate(user._id, {
          loggedIn: false
        })
        .exec((err, user): void => {
          if (err || !user) {
            return next(err);
          } else {
            res.json({
              message: 'Successfully logged out'
            });
          }
        });
    },

    // route middleware to verify a token
    authenticate: (req, res, next): void => {
      // check header or post parameters for token
      let token = req.body.token || req.headers['x-access-token'];

      // decode token
      if (token) {
        // Check if the user is logged in
        let user: Object = extractUserFromToken(token);
        if (!user.loggedIn) {
          return res.status(401).json({
            error: 'Unauthorized Access. Please login first'
          });
        }
        // verifies secret and checks expiry time
        jwt.verify(token, req.app.get('superSecret'), (err, decoded): void => {
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
    },

    getSession: (req, res): void => {
      // check header or post parameters for token
      let token = req.body.token || req.headers['x-access-token'];

      // decode token
      if (token) {
        // verifies secret and checks expiry time
        jwt.verify(token, req.app.get('superSecret'), (err, decoded): void => {
          if (err) {
            // If the token cannot be verified, return false
            res.json({
              loggedIn: 'false'
            });
          } else {
            // Return user's loggedIn status from the DB
            Users.findById(decoded._id)
              .populate('role')
              .exec((err, user): void => {
                if (err || !user) {
                  res.json({
                    loggedIn: 'false'
                  });
                } else {
                  return res.json({
                    user: user,
                    loggedIn: user.loggedIn.toString()
                  });
                }
              });
          }
        });
      } else {
        // if there is no token, return a logged out status
        return res.json({
          loggedIn: 'false'
        });
      }
    }

  };
})();
