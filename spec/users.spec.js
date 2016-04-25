describe('User Spec', () => {
  'use strict';

  let async = require('async');
  let helper = require('./helper');
  let request = require('supertest');
  let app = require('../index');
  let extractUserFromToken = require('../server/controllers/utils').extractUserFromToken;
  let token = null;
  let Documents = require('../server/models/documents');
  let Roles = require('../server/models/roles');

  beforeEach((done) => {
    helper.beforeEach(token, (generatedToken) => {
      token = generatedToken;
      done();
    });
  });

  describe('User Creation', () => {
    it('should create a user successfully', (done) => {
      request(app)
        .post('/api/users')
        .send({
          username: 'johnSnow',
          firstname: 'John',
          lastname: 'Snow',
          email: 'snow@winterfell.org',
          password: 'knfenfenfen',
          role: Roles.schema.paths.title.default()
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.user.username).toBe('johnSnow');
          expect(res.body.user.name.first).toBe(
            'John');
          expect(res.body.user.name.last).toBe(
            'Snow');
          expect(res.body.token).not.toBeNull();
          expect(res.body.user.id).not.toBeNull();
          done();
        });
    });

    it('should log in the user after signup', (done) => {
      let userID = null;
      let userToken = null;
      async.series([
          function(callback) {
            // Create the user
            request(app)
              .post('/api/users')
              .send({
                username: 'jnSnow',
                firstname: 'John',
                lastname: 'Snow',
                email: 'Jjsnow@winterfell.org',
                password: 'knffenfen',
                role: Roles.schema.paths.title.default()
              })
              .set('Accept', 'application/json')
              .end((err, res) => {
                expect(err).toBeNull();
                expect(res.statusCode).toBe(201);
                userID = res.body.user._id;
                userToken = res.body.token;
                callback(err, userToken);
              });
          },
          function(callback) {
            request(app)
              .get('/api/users/' + userID)
              .set('x-access-token', userToken)
              .end((err, res) => {
                expect(res.statusCode).toBe(200);
                callback(null, res.body.loggedIn);
              });
          }
        ],
        // optional callback
        function(err, results) {
          // results holds the values from the callbacks
          expect(results[1]).toBe(true);
          done();
        });
    });

    it('should enforce a unique username field', (done) => {
      // Try to provide a duplicate username field
      request(app)
        .post('/api/users')
        .send({
          username: 'jsnow',
          firstname: 'John',
          lastname: 'Snow',
          email: 'snow@winterfell.org',
          password: 'knfenfenfen',
          role: Roles.schema.paths.title.default()
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            'The User already exists');
          done();
        });
    });

    it('should enforce a unique email field', (done) => {
      // Try to provide a duplicate email field
      request(app)
        .post('/api/users')
        .send({
          username: 'jsnow67',
          firstname: 'John',
          lastname: 'Snow',
          email: 'jsnow@winterfell.org',
          password: 'knfenfenfen',
          role: Roles.schema.paths.title.default()
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            'The User already exists');
          done();
        });
    });

    it('should populate the user\'s role if it is not defined', (done) => {
      request(app)
        .post('/api/users')
        .send({
          username: 'newUser',
          firstname: 'John',
          lastname: 'Snow',
          email: 'snow@winterfell.org',
          password: 'knfenfenfen'
        })
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.user.role).not.toBeNull();
          // The role should be populated i.e. an object
          expect(res.body.user.role).toEqual(jasmine.any(Object));
          done();
        });
    });

    it('should raise an error if required attributes are missing', (
      done) => {
      request(app)
        .post('/api/users')
        .send({
          username: 'kevin',
          firstname: 'Kevin',
          email: 'kev@winterfell.org',
          password: 'knnfenfen',
          role: Roles.schema.paths.title.default()
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            'Please provide the username, firstname, ' +
            'lastname, email, and password values');
          done();
        });
    });

  });

  describe('User Get', () => {
    let user = null;
    let staffToken = null;

    beforeEach((done) => {
      async.waterfall([
        // Create a new user with the staff role
        (callback) => {
          // The first arg is the newly created staff
          request(app)
            .post('/api/users')
            .send({
              username: 'staffUser',
              firstname: 'John',
              lastname: 'Snow',
              email: 'snow@staff.org',
              password: 'staff',
              role: 'staff'
            })
            // Call the callback with the newly created user
            .end((err, res) => {
              callback(err, res.body.token);
            });
        }
      ], (err, generatedToken) => {
        // Decode the user object from the token
        user = extractUserFromToken(token);
        staffToken = generatedToken;
        done();
      });
    });

    it('should fetch the user\'s own profile successfully', (done) => {
      request(app)
        .get('/api/users/' + user._id)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(200);
          expect(res.body._id).toBe(user._id);
          // The password should not be returned
          expect(res.body.password).toBeUndefined();
          done();
        });
    });

    it('should not allow a user to fetch another user\'s profile', (
      done) => {
      request(app)
        .get('/api/users/' + user._id)
        .set('Accept', 'application/json')
        .set('x-access-token', staffToken)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(403);
          expect(res.body.error).toBe('Unauthorized Access');
          done();
        });
    });

  });

  describe('User update', () => {
    let userId = null;

    beforeEach((done) => {
      // Decode the user object from the token
      userId = extractUserFromToken(token)._id;
      done();
    });

    it('should update a user successfully', (done) => {
      request(app)
        .put('/api/users/' + userId)
        .send({
          username: 'theImp',
          firstname: 'Half',
          lastname: 'Man',
          email: 'masterofcoin@westeros.org'
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(200);
          expect(res.body.username).toBe('theImp');
          expect(res.body.name.first).toBe('Half');
          expect(res.body.name.last).toBe('Man');
          expect(res.body.email).toBe('masterofcoin@westeros.org');
          done();
        });
    });

  });

  describe('User delete', () => {
    let userId = null;

    beforeEach((done) => {
      // Decode the user object from the token
      userId = extractUserFromToken(token)._id;
      done();
    });

    it('should delete a user successfully', (done) => {
      request(app)
        .delete('/api/users/' + userId)
        .set('x-access-token', token)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(204);
          done();
        });
    });

  });

  describe('User Documents', () => {
    it('should get a user\'s documents', (done) => {
      Documents.find({})
        .limit(1)
        .exec((err, doc) => {
          let userId = doc[0].ownerId;
          request(app)
            .get('/api/users/' + userId + '/documents')
            .expect('Content-Type', /json/)
            .set('x-access-token', token)
            .expect(200)
            .end((err, res) => {
              expect(err).toBeNull();
              // It should return the user's 3 documents
              expect(res.body.length).toBe(3);
              done();
            });
        });
    });
  });

  describe('getAllUsers function', () => {
    let adminToken = null;

    beforeEach((done) => {
      async.waterfall([
        // Create the admin role in the DB
        (callback) => {
          Roles.create({
            title: 'admin'
          }, (err, adminRole) => {
            callback(err, adminRole);
          });
        },
        // Create a new user with the admin role
        (admin, callback) => {
          // The first arg is the newly created adminRole
          request(app)
            .post('/api/users')
            .send({
              username: 'adminUser',
              firstname: 'John',
              lastname: 'Snow',
              email: 'snow@admin.org',
              password: 'admin',
              role: 'admin'
            })
            // Call the callback with the user's token
            .end((err, res) => {
              callback(err, res.body.token);
            });
        }
      ], (err, generatedToken) => {
        adminToken = generatedToken;
        done();
      });
    });

    it('should return all users when called by admin user', (done) => {
      // The 2 seeded Roles should be returned
      request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .set('x-access-token', adminToken)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.length).toBe(3);
          expect(res.body[0].username).toBe('jsnow');
          expect(res.body[1].username).toBe('nstark');
          expect(res.body[2].username).toBe('adminUser');
          done();
        });
    });

    it('should not be accessible to regular users', (done) => {
      request(app)
        .get('/api/users')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(403);
          expect(res.body.error).toBe('Unauthorized Access');
          done();
        });
    });
  });

  describe('User Actions', () => {
    let user = null;
    let userToken = null;
    let userPassword = 'knfenfenfen';

    beforeEach((done) => {
      request(app)
        .post('/api/users')
        .send({
          username: 'jeremy',
          firstname: 'not',
          lastname: 'ceo',
          email: 'jerenotceo@andela.com',
          password: userPassword
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(err).toBeNull();
          // Save the new user in a variable
          user = res.body.user;
          userToken = res.body.token;
          // Expect the user to be logged in
          expect(res.body.user.loggedIn).toBe(true);
          done();
        });
    });

    it('should login and logout user successfully', (done) => {
      async.series([
          function(callback) {
            // logout the user
            request(app)
              .post('/api/users/logout')
              .set('x-access-token', userToken)
              .end((err, res) => {
                expect(res.statusCode).toBe(200);
                callback(null, res.body);
              });
          },
          function(callback) {
            request(app)
              .post('/api/users/login')
              .send({
                username: user.username,
                password: userPassword
              })
              .end((err, res) => {
                callback(null, res.body.user.loggedIn);
              });
          }
        ],
        // optional callback
        function(err, results) {
          expect(results[0].message).toBe(
            'Successfully logged out');
          // The loggedIn flag should be set to true
          expect(results[1]).toBe(true);
          done();
        });
    });
  });

  describe('User Session', () => {
    it('should return false if no token is provided', (done) => {
      request(app)
        .get('/api/users/session')
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.loggedIn).toBe('false');
          done();
        });
    });

    it('should return true if the user is logged in', (done) => {
      request(app)
        .get('/api/users/session')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.loggedIn).toBe('true');
          done();
        });
    });

    it('should return false if the token is invalid', (done) => {
      request(app)
        .get('/api/users/session')
        .set('x-access-token', 'i-will-hack-you')
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.loggedIn).toBe('false');
          done();
        });
    });

    it('should return false if the user is logged out', (done) => {
      async.series([
          function(callback) {
            // logout the user
            request(app)
              .post('/api/users/logout')
              .set('x-access-token', token)
              .end((err, res) => {
                expect(res.statusCode).toBe(200);
                callback(null, res.body.message);
              });
          },
          function(callback) {
            request(app)
              .get('/api/users/session')
              .set('x-access-token', token)
              .end((err, res) => {
                expect(res.statusCode).toBe(200);
                expect(res.body.loggedIn).toBe('false');
                callback(null, res.body.loggedIn);
              });
          }
        ],
        // optional callback
        function(err, results) {
          // results holds the values from the callbacks
          expect(results[1]).toBe('false');
          done();
        });
    });

  });
});
