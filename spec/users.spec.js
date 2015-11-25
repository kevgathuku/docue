describe('User Spec', function() {
  'use strict';

  let helper = require('./helper');
  let userController = require('../server/controllers/users');

  beforeEach(function(done) {
    // Empty the DB then fill in some dummy data
    helper.clearDb(function() {
      helper.seedRoles(done);
    });
  });

  describe('User Creation', function() {
    it('should create a unique user', function(done) {
      userController.create('lastName', 'firstName', function(err, user) {
        // A duplicate user should not be created
        expect(user).toBeNull();
        expect(err.name).toBe('ValidationError');
        expect(err.message).toBe('User already exists');
        done();
      });
    });

    it('should create a user with both first and last names', function(done) {
      userController.create('last', 'first', function(err, user) {
        expect(user).not.toBeNull();
        expect(user.name.last).toBe('last');
        expect(user.name.first).toBe('first');
        done();
      });
    });

    it('a new user should have a role defined', function(done) {
      userController.create('last', 'first', function(err, user) {
        expect(user).not.toBeNull();
        expect(user.role).not.toBeNull();
        done();
      });
    });

  });

  describe('getAllUsers function', function() {

    it('should return all users when called', function(done) {
      userController.all(function(err, users) {
        // The 3 seeded Users objects should be returned
        expect(users.length).toBe(3);
        done();
      });
    });

  });
});
