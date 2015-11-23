describe('Roles Spec', function() {
  'use strict';

  let Role = require('../server/models/roles');

  it('should create a role with a unique title', function() {
    // Try to create a duplicate role
    Role.create({
      title: 'Admin'
    }, function(err, role) {
      expect(err).not.toBe(null);
    })
  });
});
