import test from 'ava';
import request from 'supertest';

const helper = require('./helpers/helper');
const Promise = require('bluebird');

const Documents = require('../server/models/documents');
const Roles = require('../server/models/roles');
import { createTestApp } from '../index';
const extractUserFromToken = require('../server/controllers/utils')
  .extractUserFromToken;

test.beforeEach('Document: beforeEach', async t => {
  // This runs before each test
  const generatedToken = await helper.beforeEach();
  t.context.token = generatedToken;

  // Decode the user object from the token
  t.context.userId = extractUserFromToken(generatedToken)._id;
});

test.serial('should create a user successfully', async t => {
  const res = await request(createTestApp())
    .post('/api/users')
    .send({
      username: 'johnSnow',
      firstname: 'John',
      lastname: 'Snow',
      email: 'snow@winterfell.org',
      password: 'knfenfenfen',
      role: Roles.schema.paths.title.default(),
    })
    .set('Accept', 'application/json');

  t.is(res.statusCode, 201);
  t.is(res.body.user.username, 'johnSnow');
  t.is(res.body.user.name.first, 'John');
  t.is(res.body.user.name.last, 'Snow');
  t.truthy(res.body.token);
  t.truthy(res.body.user._id);
});

test.serial.cb('should log in the user after signup', t => {
  let userID = null;
  let userToken = null;
  // Create the user
  request(createTestApp())
    .post('/api/users')
    .set('Accept', 'application/json')
    .send({
      username: 'jnSnow',
      firstname: 'John',
      lastname: 'Snow',
      email: 'Jjsnow@winterfell.org',
      password: 'knffenfen',
      role: Roles.schema.paths.title.default(),
    })
    .then(res => {
      t.is(res.statusCode, 201);
      userID = res.body.user._id;
      userToken = res.body.token;
      return Promise.resolve(userToken);
    })
    .then(userToken => {
      return request(createTestApp())
        .get('/api/users/' + userID)
        .set('x-access-token', userToken);
    })
    .then(res => {
      t.is(res.statusCode, 200);
      t.true(res.body.loggedIn);
      t.end();
    })
    .catch(err => {
      t.end(err);
    });
});

test.serial('should enforce a unique username field', async t => {
  // Try to provide a duplicate username field
  const res = await request(createTestApp())
    .post('/api/users')
    .send({
      username: 'jsnow',
      firstname: 'John',
      lastname: 'Snow',
      email: 'snow@winterfell.org',
      password: 'knfenfenfen',
      role: Roles.schema.paths.title.default(),
    })
    .set('Accept', 'application/json');

  t.is(res.statusCode, 400);
  t.is(res.body.error, 'The User already exists');
});

test.serial('should enforce a unique email field', async t => {
  // Try to provide a duplicate email field
  const res = await request(createTestApp())
    .post('/api/users')
    .send({
      username: 'jsnow67',
      firstname: 'John',
      lastname: 'Snow',
      email: 'jsnow@winterfell.org',
      password: 'knfenfenfen',
      role: Roles.schema.paths.title.default(),
    })
    .set('Accept', 'application/json');

  t.is(res.statusCode, 400);
  t.is(res.body.error, 'The User already exists');
});

test.serial("should populate the user's role if it is not defined", async t => {
  const res = await request(createTestApp())
    .post('/api/users')
    .send({
      username: 'newUser',
      firstname: 'John',
      lastname: 'Snow',
      email: 'snow@winterfell.org',
      password: 'knfenfenfen',
    });

  t.is(res.statusCode, 201);
  t.truthy(res.body.user.role);
  // The role should be populated i.e. an object
  t.is(typeof res.body.user.role, 'object');
});

test.serial(
  'should raise an error if required attributes are missing',
  async t => {
    const res = await request(createTestApp())
      .post('/api/users')
      .send({
        username: 'kevin',
        firstname: 'Kevin',
        email: 'kev@winterfell.org',
        password: 'knnfenfen',
        role: Roles.schema.paths.title.default(),
      })
      .set('Accept', 'application/json');

    t.is(res.statusCode, 400);
    t.is(
      res.body.error,
      'Please provide the username, firstname, ' +
        'lastname, email, and password values'
    );
  }
);

// User update functionality
test.serial('should update a user successfully', async t => {
  const res = await request(createTestApp())
    .put('/api/users/' + t.context.userId)
    .send({
      username: 'theImp',
      firstname: 'Half',
      lastname: 'Man',
      email: 'masterofcoin@westeros.org',
    })
    .set('Accept', 'application/json')
    .set('x-access-token', t.context.token);

  t.is(res.statusCode, 200);
  t.is(res.body.username, 'theImp');
  t.is(res.body.name.first, 'Half');
  t.is(res.body.name.last, 'Man');
  t.is(res.body.email, 'masterofcoin@westeros.org');
});

test.serial('should throw an error if a user does not exist', async t => {
  const res = await request(createTestApp())
    .put('/api/users/i-do-not-exist')
    .send({
      username: 'theImp',
      firstname: 'Half',
      lastname: 'Man',
      email: 'masterofcoin@westeros.org',
    })
    .set('Accept', 'application/json')
    .set('x-access-token', t.context.token);

  // Should be treated as trying to access another user's profile
  t.is(res.statusCode, 403);
  t.is(res.body.error, 'Unauthorized Access');
});

// User delete functionality
test.serial('should delete a user successfully', async t => {
  const res = await request(createTestApp())
    .delete('/api/users/' + t.context.userId)
    .set('x-access-token', t.context.token);

  t.is(res.statusCode, 204);
});

test.serial('should raise an error when given an invalid user', async t => {
  const res = await request(createTestApp())
    .delete('/api/users/cant-touch-this')
    .set('x-access-token', t.context.token);

  t.is(res.statusCode, 403);
  t.is(res.body.error, 'Unauthorized Access');
});

test.serial.cb("should get a user's documents", t => {
  Documents.find({})
    .limit(1)
    .exec((err, doc) => {
      const userId = doc[0].ownerId;
      request(createTestApp())
        .get('/api/users/' + userId + '/documents')
        .set('x-access-token', t.context.token)
        .end((err, res) => {
          t.is(res.statusCode, 200);
          // It should return the user's 3 documents
          t.is(res.body.length, 3);
          t.end();
        });
    });
});

// describe('getAllUsers function', () => {
//   let adminToken = null;

//   beforeEach(async t => {
//     // Create the admin role in the DB
//     Roles.create({
//       title: 'admin',
//     })
//       .then(adminRole => {
//         return request(app)
//           .post('/api/users')
//           .send({
//             username: 'adminUser',
//             firstname: 'John',
//             lastname: 'Snow',
//             email: 'snow@admin.org',
//             password: 'admin',
//             role: adminRole.title, // 'admin'
//           });
//       })
//       .then(res => {
//         adminToken = res.body.token;
//         done();
//       })
//       .catch(err => {
//         console.log('Error', err);
//         done();
//       });
//   });

// //   test.serial('should return all users when called by admin user', async t => {
// //     // The 2 seeded Roles should be returned
// //     request(app)
// //       .get('/api/users')
// //       .set('Accept', 'application/json')
// //       .set('x-access-token', adminToken)
// //       .end((err, res) => {
// //         expect(err).toBeNull();
// //         expect(res.body.length).toBe(3);
// //         expect(res.body[0].username).toBe('jsnow');
// //         expect(res.body[1].username).toBe('nstark');
// //         expect(res.body[2].username).toBe('adminUser');
// //         done();
// //       });
// //   });

// //   test.serial('should not be accessible to regular users', async t => {
// //     request(app)
// //       .get('/api/users')
// //       .set('x-access-token', token)
// //       .end((err, res) => {
// //         expect(res.statusCode).toBe(403);
// //         expect(res.body.error).toBe('Unauthorized Access');
// //         done();
// //       });
// //   });
// // });

// // describe('User Actions', () => {
// //   let user = null;
// //   let userToken = null;
// //   const userPassword = 'knfenfenfen';

// //   beforeEach(async t => {
// //     request(app)
// //       .post('/api/users')
// //       .send({
// //         username: 'jeremy',
// //         firstname: 'not',
// //         lastname: 'ceo',
// //         email: 'jerenotceo@andela.com',
// //         password: userPassword,
// //       })
// //       .set('Accept', 'application/json')
// //       .end((err, res) => {
// //         expect(err).toBeNull();
// //         // Save the new user in a variable
// //         user = res.body.user;
// //         userToken = res.body.token;
// //         // Expect the user to be logged in
// //         expect(res.body.user.loggedIn).toBe(true);
// //         done();
// //       });
// //   });

// //   test.serial('should login and logout user successfully', async t => {
// //     // logout the user
// //     request(app)
// //       .post('/api/users/logout')
// //       .set('x-access-token', userToken)
// //       .then(res => {
// //         expect(res.statusCode).toBe(200);
// //         expect(res.body.message).toBe('Successfully logged out');
// //         return Promise.resolve(res.body);
// //       })
// //       .then(() => {
// //         return request(app)
// //           .post('/api/users/login')
// //           .send({
// //             username: user.username,
// //             password: userPassword,
// //           });
// //       })
// //       .then(res => {
// //         // The loggedIn flag should be set to true
// //         expect(res.body.user.loggedIn).toBe(true);
// //         done();
// //       })
// //       .catch(err => {
// //         console.log('Error', err);
// //         done();
// //       });
// //   });
// // });

// User Session
test.serial('should return false if no token is provided', async t => {
  const res = await request(createTestApp()).get('/api/users/session');

  t.is(res.statusCode, 200);
  t.is(res.body.loggedIn, 'false');
});

test.serial('should return true if the user is logged in', async t => {
  const res = await request(createTestApp())
    .get('/api/users/session')
    .set('x-access-token', t.context.token);

  t.is(res.statusCode, 200);
  t.is(res.body.loggedIn, 'true');
});

test.serial('should return false if the token is invalid', async t => {
  const res = await request(createTestApp())
    .get('/api/users/session')
    .set('x-access-token', 'i-will-hack-you');

  t.is(res.statusCode, 200);
  t.is(res.body.loggedIn, 'false');
});

test.serial.cb('should return false if the user is logged out', t => {
  // logout the user
  request(createTestApp())
    .post('/api/users/logout')
    .set('x-access-token', t.context.token)
    .then(res => {
      t.is(res.statusCode, 200);
      return Promise.resolve(res.body.message);
    })
    .then(() => {
      return request(createTestApp())
        .get('/api/users/session')
        .set('x-access-token', t.context.token);
    })
    .then(res => {
      t.is(res.statusCode, 200);
      t.is(res.body.loggedIn, 'false');
      t.end();
    })
    .catch(err => {
      t.end(err);
    });
});
