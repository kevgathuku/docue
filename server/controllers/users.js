(() => {
  'use strict';


  let Users = require('../models/users');
  let Roles = require('../models/roles');

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


  };
})();
