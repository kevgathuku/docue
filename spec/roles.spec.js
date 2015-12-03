describe('Roles Spec', function() {
  'use strict';

  let request = require('supertest');
  let helper = require('./helper');
  let app = require('../index');
  let token = null;

  beforeEach(function(done) {
    helper.beforeEach(token, function(generatedToken) {
      token = generatedToken;
      done();
    });
  });

  describe('Role Creation', function() {
    it('should create a role successfully', function(done) {
      // Try to create an allowed but non-existent role
      request(app)
        .post('/api/roles')
        .send({
          title: 'admin',
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(201)
        .end(function(err, res) {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.title).toBe('admin');
          expect(res.body.id).not.toBeNull();
          done();
        });
    });

    it('should not create a role without a title', function(done) {
      request(app)
        .post('/api/roles')
        .send({
          title: '',
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end(function(err, res) {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            'The role title is required');
          done();
        });
    });

    it('should not create a duplicate role', function(done) {
      // Try to create a duplicate role
      request(app)
        .post('/api/roles')
        .send({
          title: 'user',
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end(function(err, res) {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.title).toBeUndefined();
          expect(res.body.error).toBe('Role already exists');
          done();
        });
    });

    it('should not create an invalid role', function(done) {
      let invalidTitle = 'invalid title';
      request(app)
        .post('/api/roles')
        .send({
          title: invalidTitle,
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end(function(err, res) {
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            invalidTitle + ' is not a valid role title');
          done();
        });
    });

  });

  describe('Get All Roles', function() {
    it('should return all roles', function(done) {
      // The 2 seeded Roles should be returned
      request(app)
        .get('/api/roles')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(res.body.length).toBe(2);
          done();
        });
    });

    it('getAllRoles should return the correct roles', function(done) {
      request(app)
        .get('/api/roles')
        .set('x-access-token', token)
        .end(function(err, res) {
          let allRoles = res.body.map(role => role.title);
          expect(err).toBeNull();
          expect(allRoles[0]).toBe('user');
          expect(allRoles[1]).toBe('staff');
          done();
        });
    });

  });

});
