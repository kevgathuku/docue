(() => {
  'use strict';

  let Role = require('../models/roles');

  module.exports = {
    create: function(req, res) {
      let validRoles = Role.schema.paths.title.enumValues;
      if (!req.body.title) {
        res.status(400).json({
          error: 'The role title is required'
        });
      } else if (validRoles.indexOf(req.body.title) === -1) {
        // Handle an invalid role title
        res.status(400).json({
          error: req.body.title +
            ' is not a valid role title'
        });
      }
      // Find if the role exists
      Role.findOne({
        title: req.body.title
      }, function(err, role) {
        if (role) {
          // If the role already exists send a validation error
          res.status(400).json({
            error: 'Role already exists'
          });
        } else {
          // If the role does not exist, create it
          Role.create({
            title: req.body.title
          }, function(error, newRole) {
            if (!error) {
              res.status(201).json(newRole);
            }
          });
        }
      });
    },

    all: function(req, res) {
      Role.find(function(err, roles) {
        res.json(roles);
      });
    },

  };
})();
