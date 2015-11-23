(function() {
  'use strict';
  /**
   * Module dependencies.
   */

  var mongoose = require('../server/config/db');
  let Role = require('../server/models/roles');

  exports.clearDb = function(done) {
    var conn = mongoose.connection;
    conn.on('open', function() {
      conn.db.dropDatabase(function(err, result) {
        console.log('DB cleared');
        // conn.close();
        done();
      });
    });
  };

  exports.seedRoles = function(done) {
    let roles = [{
      title: 'Admin'
    }, {
      title: 'SuperAdmin'
    }, {
      title: 'Sensei'
    }];

    Role.create(roles, function(err) {
      if (!err) {
        console.log('Seed Roles Created');
        done();
      }
    });

  };
})();
