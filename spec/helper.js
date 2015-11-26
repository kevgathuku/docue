(function() {
  'use strict';

  let Roles = require('../server/models/roles');
  let Users = require('../server/models/users');

  module.exports = {
    clearDb: function(next) {
      Roles.remove({}, function(err) {
        if (!err) {
          Users.remove({}, function(error) {
            if (!error) {
              next();
            }
          });
        }
      });
    },

    seedRoles: function(next) {
      let roles = [{
        title: 'viewer'
      }, {
        title: 'owner'
      }];

      Roles.create(roles, function() {
        next();
      });
    },

    seedUsers: function(next) {
      let users = [{
        username: 'jsnow',
        name: {
          first: 'John',
          last: 'Snow'
        },
        'email': 'jsnow@winterfell.org',
        'password': 'youKnowNothing'
      }, {
        username: 'nstark',
        name: {
          first: 'Ned',
          last: 'Stark'
        },
        'email': 'nstark@winterfell.org',
        'password': 'winterIsComing'
      }];

      Users.create(users, function() {
        next();
      });
    },

  };


})();
