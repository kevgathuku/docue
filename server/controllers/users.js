(() => {
  'use strict';


  let Users = require('../models/users');
  let Roles = require('../models/roles');

  module.exports = {
    create: function(req, res) {
      // Find if the user exists
      Users.findOne({
        username: req.body.username
      }, function(err, user) {
        if (user) {
          // If the user already exists
          // Call the callback with an error object and a null user
          res.status(400).json({
            error: 'User already exists'
          });
        } else if (!req.body.role) {
          res.status(400).json({
            error: 'The user\'s role should be defined'
          });
        } else {
          Roles.findOne({
            title: req.body.role
          }, function(role) {
            // Create the user
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
              // Return the newly created user
              res.json(newUser);
            });
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
