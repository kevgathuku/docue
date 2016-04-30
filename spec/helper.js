(() => {
  'use strict';

  let async = require('async');
  let Documents = require('../server/models/documents');
  let Roles = require('../server/models/roles');
  let Users = require('../server/models/users');
  let request = require('supertest');
  let app = require('../index');

  let testPassword = 'youKnowNothing';

  let seedRoles = (next) => {
    // Users will be created with the first role
    let roles = [{
      title: 'viewer',
      accessLevel: 0
    }, {
      title: 'staff',
      accessLevel: 1
    }];

    Roles.create(roles, (err, roles) => {
      next(err, roles);
    });
  };

  let seedUsers = (role, next) => {
    // Documents will be created with the first user, role = viewer
    let users = [{
      username: 'jsnow',
      name: {
        first: 'John',
        last: 'Snow'
      },
      email: 'jsnow@winterfell.org',
      password: testPassword,
      role: role
    }, {
      username: 'nstark',
      name: {
        first: 'Ned',
        last: 'Stark'
      },
      email: 'nstark@winterfell.org',
      password: 'winterIsComing',
      role: role
    }];

    Users.create(users, (err, createdUsers) => {
      next(err, createdUsers);
    });
  };

  let seedDocuments = (user, next) => {
    let documents = [{
      title: 'Doc1',
      content: '1Doc',
      ownerId: user._id,
      role: user.role
    }, {
      title: 'Doc2',
      content: '2Doc',
      ownerId: user._id,
      role: user.role
    }, {
      title: 'Doc3',
      content: '3Doc',
      ownerId: user._id,
      role: user.role
    }];

    Documents.create(documents[0])
      .then(() => {
        // First document was created successfully
        // Create the second document
        return Documents.create(documents[1]);
      })
      .then((doc1) => {
        // Add one day to the second doc's timestamp
        let date = new Date(doc1.dateCreated);
        date.setDate(date.getDate() + 1);
        doc1.dateCreated = date;
        return doc1.save();
      })
      .then(() => {
        // Second document updated successfully
        // Create the final document
        return Documents.create(documents[2]);
      })
      .then((doc2) => {
        // Add 2 days to the third doc's timestamp
        let date = new Date(doc2.dateCreated);
        date.setDate(date.getDate() + 2);
        doc2.dateCreated = date;
        return doc2.save();
      })
      .then(() => {
        console.log('Seed documents created successfully');
        next();
      })
      .catch((err) => {
        console.log('Error Creating Seed Documents', err);
      });
  };

  // Utility function for emptying the database
  let clearDb = (next) => {
    async.series([
        (callback) => {
          // Remove all Documents
          Documents.remove({}, (err, result) => {
            callback(err, result);
          });
        },
        (callback) => {
          // Remove all Roles
          Roles.remove({}, (err, result) => {
            callback(err, result);
          });
        },
        (callback) => {
          // Remove all Users
          Users.remove({}, (err, result) => {
            callback(err, result);
          });
        }
      ],
      // Callback called after all functions are done
      (err, results) => {
        // Call next after all collections are emptied
        next(err, results);
      });
  };

  // Receives a null token and a callback function
  // Calls the callback function with the generated token
  let beforeEach = (token, done) => {
    // Empty the DB then fill in the Seed data
    async.waterfall([
      // Run the clearDb function and call the callback
      function(callback) {
        clearDb((err, results) => {
          callback(err, results);
        });
      },
      // Seed the roles and call the callback with the seeded roles
      function(results, callback) {
        // results is the return value of the clearDb function
        // The call back is called with (err, roles) arguments
        seedRoles((err, roles) => {
          callback(err, roles);
        });
      },
      // Seed the users and call the callback with the seeded users
      function(roles, callback) {
        seedUsers(roles[0], (err, users) => {
          callback(err, users);
        });
      },
      // Seed the documents and call the callback with the seeded docs
      function(users, callback) {
        seedDocuments(users[0], () => {
          // Get a login token
          request(app)
            .post('/api/users/login')
            .send({
              username: users[0].username,
              password: testPassword
            })
            .end((err, res) => {
              // Call the callback with the generated token
              callback(err, res.body.token);
            });
        });
      }
    ], function(err, generatedToken) {
      done(generatedToken);
    });
  };

  module.exports = {
    beforeEach: beforeEach
  };

})();
