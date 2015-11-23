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
    roleController.create('Admin', function(err, role) {
      expect(role).toBeNull();
      expect(err.name).toBe('ValidationError');
      expect(err.message).toBe('Role already exists');
      done();
    });
  });

  it('should return all roles when getAllRoles is called', function(done) {
    roleController.all(function(err, roles) {
      expect(err).toBeNull();
      // The 3 seeded Roles should be returned
      expect(roles.length).toBe(3);
      done();
    });
  });

  it('getAllRoles should return the correct roles', function(done) {
    roleController.all(function(err, roles) {
      // Make an array of the role titles
      let allRoles = roles.map(function(role) {
        return role.title;
      });
      // Assert that they contain the correct content
      expect(allRoles).toContain('Admin');
      expect(allRoles).toContain('SuperAdmin');
      expect(allRoles).toContain('Sensei');
      done();
    });
  });
});
