describe('Roles Spec', function() {
  'use strict';

  let helper = require('./helper');
  let roleController = require('../server/controllers/roles');

  beforeEach(function(done) {
    // Empty the DB then fill in some dummy data
    helper.clearDb(function() {
      helper.seedRoles(done);
    });
  });

  it('should create a role with a unique title', function(done) {
    // Try to create a duplicate role
    roleController.create('viewer', function(err, role) {
      expect(role).toBeNull();
      expect(err.name).toBe('ValidationError');
      expect(err.message).toBe('Role already exists');
      done();
    });
  });

  it('should not create a role with an invalid title', function(done) {
    // Try to create a duplicate role
    roleController.create('invalidTitle', function(err, role) {
      expect(role).toBeUndefined();
      done();
    });
  });

  describe('getAllRoles function', function() {
    it('should return all roles when getAllRoles is called', function(done) {
      roleController.all(function(err, roles) {
        // The 3 seeded Roles should be returned
        expect(roles.length).toBe(2);
        done();
      });
    });

    it('getAllRoles should return the correct roles', function(done) {
      roleController.all(function(err, roles) {
        // Make an array of the role titles
        let allRoles = roles.map(role => role.title);
        // Assert that they contain the correct content
        expect(allRoles[0]).toBe('viewer');
        expect(allRoles[1]).toBe('owner');
        done();
      });
    });

  });

});
