(function() {
  'use strict';

  let Role = require('../models/roles');

  module.exports = {
    create: function(title, callback) {
      // Find if the role exists
      Role.findOne({
        title: title
      }, function(err, role) {
        if (role) {
          // If the role already exists
          // Call the callback with an error object and a null role
          callback({
            name: 'ValidationError',
            message: 'Role already exists'
          }, null);
        } else {
          // If the role does not exist, create it
          Role.create({
            title: title
          }, function(error, newRole) {
            // Call the callback with a null error and the newly created role
            callback(null, newRole);
          });
        }
      });
    },

  };
})();
