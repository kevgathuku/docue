describe('User Spec', function() {
  'use strict';

  const got = require('got');
  const helper = require('./helper');
  const userController = require('../server/controllers/users');
  const baseUrl = 'http://localhost:3000/api/';

  beforeEach(function(done) {
    // Empty the DB then fill in some dummy data
    this.usersRoute = baseUrl + 'users';
    helper.clearDb(function() {
      helper.seedRoles(helper.seedUsers(function() {
        done();
      }));
    });
  });

  describe('User Creation', function() {
    it('should create a user successfully', function(done) {
      got.post(this.usersRoute, {
          form: {
            username: 'johnSnow',
            firstname: 'John',
            lastname: 'Snow',
            email: 'snow@winterfell.org',
            password: 'knfenfenfen'
          }
        })
        .then(response => {
          expect(response.statusCode).toBe(201);
          expect(JSON.parse(response.body).username).toBe(
            'johnSnow');
          expect(JSON.parse(response.body).name.first).toBe(
            'John');
          expect(JSON.parse(response.body).name.last).toBe(
            'Snow');
        })
        .catch(error => {
          expect(error).toBeNull();
        });
      done();
    });

    it('should not create a duplicate user', function(done) {
      // Try to create a duplicate user
      got.post(this.usersRoute, {
          form: {
            username: 'jsnow',
            firstname: 'John',
            lastname: 'Snow',
            email: 'jsnow@winterfell.org',
            password: 'knfenfenfen'
          }
        })
        .then(response => {
          expect(response.statusCode).toBe(400);
          expect(JSON.parse(response.body).error).toBe(
            'User already exists');
        })
        .catch(error => {
          expect(error).toBeNull();
        });
      done();
    });

    it('should require user\'s role to be defined', function(done) {
      got.post(this.usersRoute, {
          form: {
            username: 'johnSnow',
            firstname: 'John',
            lastname: 'Snow',
            email: 'snow@winterfell.org',
            password: 'knfenfenfen'
          }
        })
        .then(response => {
          expect(response.statusCode).toBe(400);
          expect(JSON.parse(response.body).message).toBe(
            'The user\'s role should be defined');
        })
        .catch(error => {
          expect(error).toBeNull();
        });
      done();
    });

  });

  describe('getAllUsers function', function() {

    it('should return all users when called', function(done) {
      got(this.usersRoute)
        .then(response => {
          // Should return the 2 seeded users
          expect(JSON.parse(response.body).length).toBe(2);
          expect(JSON.parse(response.body[0]).username).toBe(
            'jsnow');
          expect(JSON.parse(response.body[1]).username).toBe(
            'nstark');
          console.log(response.body);
        })
        .catch(error => {
          expect(error).toBeNull();
        });
      done();
    });

  });
});
