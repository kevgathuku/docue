(() => {
  'use strict';

  let Promise = require('bluebird');
  let Documents = require('../server/models/documents');
  let Roles = require('../server/models/roles');
  let Users = require('../server/models/users');
  let request = require('supertest');
  let app = require('../index');

  let testPassword = 'youKnowNothing';

  let getLoginToken = (user, callback) => {
    // Get a login token
    request(app)
      .post('/api/users/login')
      .send({
        username: user.username,
        password: testPassword
      })
      .end((err, res) => {
        // Call the callback with the generated token
        callback(err, res.body.token);
      });
  };

  let getLoginTokenAsync = Promise.promisify(getLoginToken);

  let seedRoles = () => {
    // Users will be created with the first role
    let roles = [{
      title: 'viewer',
      accessLevel: 0
    }, {
      title: 'staff',
      accessLevel: 1
    }];
    // return a promise
    return Roles.create(roles);
  };

  let seedUsers = (role) => {
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

    return Users.create(users);
  };

  let seedDocuments = (user) => {
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

    return Documents.create(documents[0])
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
        // return a Promise that resolves with the provided user
        return Promise.resolve(user);
      });
  };

  // Utility function for emptying the database
  let clearDb = () => {
    // Remove all docs
    return Documents.remove({})
      .then(() => {
        // Remove all roles
        return Roles.remove({});
      })
      .then(() => {
        // Remove all users
        return Users.remove({});
      });
  };

  // Returns a promise of a generated token
  let beforeEach = () => {
    // Empty the DB then fill in the Seed data
    return clearDb()
      .then(() => {
        return seedRoles();
      })
      .then((roles) => {
        // Seed the users with the first role from the previous step
        return seedUsers(roles[0]);
      })
      .then((users) => {
        // Seed the documents with the first user from the previous step
        return seedDocuments(users[0]);
      })
      .then((user) => {
        // Return a promise that resolves with the eventual login token
        return getLoginTokenAsync(user);
      });
  };

  module.exports.beforeEach = beforeEach;

})();
