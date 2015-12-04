(() => {
  'use strict';

  let async = require('async');
  let Documents = require('../server/models/documents');
  let Roles = require('../server/models/roles');
  let Users = require('../server/models/users');
  let request = require('supertest');
  let app = require('../index');

  // TODO: Refactor to use async module
  let clearDb = (next) => {
    Documents.remove({}, (err) => {
      if (!err) {
        Roles.remove({}, (err) => {
          if (!err) {
            Users.remove({}, (error) => {
              if (!error) {
                next();
              }
            });
          }
        });
      }
    });
  };

  let seedRoles = (next) => {
    let roles = [{
      title: 'viewer'
    }, {
      title: 'staff'
    }];

    Roles.create(roles, () => {
      next();
    });
  };

  let seedUsers = (next) => {
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

    Users.create(users, (err, createdUsers) => {
      next(createdUsers);
    });
  };

  let seedDocuments = (user, next) => {
    let documents = [{
      title: 'Doc1',
      content: '1Doc',
      ownerId: user._id
    }, {
      title: 'Doc2',
      content: '2Doc',
      ownerId: user._id
    }, {
      title: 'Doc3',
      content: '3Doc',
      ownerId: user._id
    }];

    async.series([
        // Hardcode the dates in order to test the order the docs are returned
        callback => {
          Documents.create(documents[0], (err, doc) => {
            // Create the first doc with today's date
            callback(err, doc);
          });
        },
        callback => {
          Documents.create(documents[1], (err, doc) => {
            // Add one day to the second doc's timestamp
            let date = new Date(doc.dateCreated);
            date.setDate(date.getDate() + 1);
            doc.dateCreated = date;
            doc.save(() => {
              callback(err, doc);
            });
          });
        },
        callback => {
          Documents.create(documents[2], (err, doc) => {
            // Add 2 days to the third doc's timestamp
            let date = new Date(doc.dateCreated);
            date.setDate(date.getDate() + 2);
            doc.dateCreated = date;
            doc.save(() => {
              callback(err, doc);
            });
          });
        },
      ],
      // Callback called after all functions are done
      () => {
        // Call next after all documents are created
        next();
      });
  };

  // Receives a null token and a callback function
  // Calls the callback function with the generated token
  let beforeEach = (token, done) => {
    // Empty the DB then fill in some dummy data
    clearDb(() => {
      seedRoles(() => {
        seedUsers((users) => {
          // Pass in the first user to seedDocuments
          // Will be the owner of the seeded documents
          seedDocuments(users[0], () => {
            // Get a login token
            request(app)
              .post('/api/users/login')
              .send({
                username: users[0].username,
                password: users[0].password
              })
              .end((err, res) => {
                token = res.body.token;
                done(token);
              });
          });
        });
      });
    });
  };

  module.exports = {
    beforeEach: beforeEach
  };

})();
