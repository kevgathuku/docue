(function() {
  'use strict';

  let Role = require('../models/roles');

  module.exports = {
    create: function(req, res) {
      // Find if the role exists
      Role.findOne({
        title: req.body.title
      }, function(err, role) {
        if (role) {
          // If the role already exists
          // Call the callback with an error object and a null role
          res.status(500).json({
            name: 'ValidationError',
            message: 'Role already exists'
          });
        } else {
          // If the role does not exist, create it
          Role.create({
            title: req.body.title
          }, function(error, newRole) {
            res.json(newRole);
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
