(function() {
  'use strict';

  let Role = require('../server/models/roles');

  exports.clearDb = function(next) {
    Role.remove({}, function(err) {
      if (!err) {
        next();
      }
    });
  };

  exports.seedRoles = function(next) {
    let roles = [{
      title: 'Admin'
    }, {
      title: 'SuperAdmin'
    }, {
      title: 'Sensei'
    }];

    Role.create(roles, function(err) {
      next();
    });

  };
})();
