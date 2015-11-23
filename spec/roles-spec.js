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
});
