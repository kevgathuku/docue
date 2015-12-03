(() => {
  'use strict';

  let Roles = require('../server/models/roles');
  let Users = require('../server/models/users');
  const request = require('supertest');
  const app = require('../index');

  let clearDb = function(next) {
    Roles.remove({}, function(err) {
      if (!err) {
        Users.remove({}, function(error) {
          if (!error) {
            next();
          }
        });
      }
    });
  };

  let seedRoles = function(next) {
    let roles = [{
      title: 'user'
    }, {
      title: 'staff'
    }];

    Roles.create(roles, function() {
      next();
    });
  };

  let seedUsers = function(next) {
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

    Users.create(users, function(err, createdUsers) {
      next(createdUsers);
    });
  };

  // Receives a null token and a callback function
  // Calls the callback function with the generated token
  let beforeEach = function(token, done) {
    // Empty the DB then fill in some dummy data
    clearDb(function() {
      seedRoles(function() {
        seedUsers(function(users) {
          request(app)
            .post('/api/users/login')
            .send({
              username: users[0].username,
              password: users[0].password
            })
            .end(function(err, res) {
              token = res.body.token;
              done(token);
            });
        });
      });
    });
  };

  module.exports = {
    beforeEach: beforeEach
  };

})();
