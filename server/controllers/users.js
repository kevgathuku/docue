(() => {
  'use strict';

  let jwt = require('jsonwebtoken'),
    Users = require('../models/users'),
    Roles = require('../models/roles');

  module.exports = {
    create: function(req, res, next) {
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
      }]).exec(function(err, user) {
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
          }, function(err, role) {
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
              }, function(error, newUser) {
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

    all: function(req, res) {
      Users.find(function(err, users) {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        } else {
          res.json(users);
        }
      });
    },

    login: function(req, res, next) {
      Users.findOne({
        username: req.body.username
      }, function(err, user) {
        if (err) {
          return next(err);
        } else if (!user) {
          res.status(401).json({
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

    // route middleware to verify a token
    authenticate: function(req, res, next) {
      // check header or post parameters for token
      let token = req.body.token || req.headers['x-access-token'];

      // decode token
      if (token) {
        // verifies secret and checks exp
        jwt.verify(token, req.app.get('superSecret'), function(err,
          decoded) {
          if (err) {
            return res.status(401).json({
              error: 'Failed to authenticate token.'
            });
          } else {
            // if everything is good, save to request for use in other routes
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

  };
})();
