const Promise = require('bluebird');
const Documents = require('../../server/models/documents');
const Roles = require('../../server/models/roles');
const Users = require('../../server/models/users');
const request = require('supertest');
const { createTestApp } = require('../../index');

const testPassword = 'youKnowNothing';

const getLoginTokenAsync = async (user) => {
  // Get a login token
  const loginRequest =  await request(createTestApp())
    .post('/api/users/login')
    .send({
      username: user.username,
      password: testPassword,
    })
    return loginRequest.body.token;
};

const seedRoles = () => {
  // Users will be created with the first role
  const roles = [
    {
      title: 'viewer',
      accessLevel: 0,
    },
    {
      title: 'staff',
      accessLevel: 1,
    },
  ];
  // return a promise
  return Roles.create(roles);
};

const seedUsers = role => {
  // Documents will be created with the first user, role = viewer
  const users = [
    {
      username: 'jsnow',
      name: {
        first: 'John',
        last: 'Snow',
      },
      email: 'jsnow@winterfell.org',
      password: testPassword,
      role: role,
    },
    {
      username: 'nstark',
      name: {
        first: 'Ned',
        last: 'Stark',
      },
      email: 'nstark@winterfell.org',
      password: 'winterIsComing',
      role: role,
    },
  ];

  return Users.create(users);
};

const seedDocuments = user => {
  const documents = [
    {
      title: 'Doc1',
      content: '1Doc',
      ownerId: user._id,
      role: user.role,
    },
    {
      title: 'Doc2',
      content: '2Doc',
      ownerId: user._id,
      role: user.role,
    },
    {
      title: 'Doc3',
      content: '3Doc',
      ownerId: user._id,
      role: user.role,
    },
  ];

  return Documents.create(documents[0])
    .then(() => {
      // First document was created successfully
      // Create the second document
      return Documents.create(documents[1]);
    })
    .then(doc1 => {
      // Add one day to the second doc's timestamp
      const date = new Date(doc1.dateCreated);
      date.setDate(date.getDate() + 1);
      doc1.dateCreated = date;
      return doc1.save();
    })
    .then(() => {
      // Second document updated successfully
      // Create the final document
      return Documents.create(documents[2]);
    })
    .then(doc2 => {
      // Add 2 days to the third doc's timestamp
      const date = new Date(doc2.dateCreated);
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
const clearDb = async () => {
  console.log("clearDb")
  // Remove all data from the DB
  await Documents.remove({});
  await Users.remove({});
  await Roles.remove({});
};

// Returns a promise of a generated token
const beforeEach = () => {
  // Empty the DB then fill in the Seed data
  return clearDb()
    .then(() => {
      return seedRoles();
    })
    .then(roles => {
      // Seed the users with the first role from the previous step
      return seedUsers(roles[0]);
    })
    .then(users => {
      // Seed the documents with the first user from the previous step
      return seedDocuments(users[0]);
    })
    .then(user => {
      // Return a promise that resolves with the eventual login token
      return getLoginTokenAsync(user);
    });
};

module.exports.beforeEach = beforeEach;
