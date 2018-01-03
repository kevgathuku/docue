describe('Roles Spec', () => {
  'use strict';

  const request = require('supertest');
  const helper = require('./helper');
  const app = require('../index');
  let token = null;

  beforeEach((done) => {
    // Promise that returns a generatedToken
    helper.beforeEach()
      .then((generatedToken) => {
        token = generatedToken;
        done();
      })
      .catch((err) => {
        console.log('Error running the beforeEach function', err);
        done();
      });
  });

  describe('Role Creation', () => {
    it('should create a role successfully', (done) => {
      // Try to create an allowed but non-existent role
      request(app)
        .post('/api/roles')
        .send({
          title: 'admin'
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.title).toBe('admin');
          // Should assign the accessLevel correctly
          expect(res.body.accessLevel).toBe(2);
          expect(res.body.id).not.toBeNull();
          done();
        });
    });

    it('should not create a role without a title', (done) => {
      request(app)
        .post('/api/roles')
        .send({
          title: ''
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            'The role title is required');
          done();
        });
    });

    it('should not create a duplicate role', (done) => {
      // Try to create a duplicate role
      request(app)
        .post('/api/roles')
        .send({
          title: 'viewer'
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.title).toBeUndefined();
          expect(res.body.error).toBe('Role already exists');
          done();
        });
    });

    it('should not create a role if the user is unauthenticated', (done) => {
      // Try to send a request without a token
      request(app)
        .post('/api/roles')
        .send({
          title: 'viewer'
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.statusCode).toBe(403);
          expect(res.body.error).toBe('No token provided.');
          done();
        });
    });

    it('should not create an invalid role', (done) => {
      const invalidTitle = 'invalid title';
      request(app)
        .post('/api/roles')
        .send({
          title: invalidTitle
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            invalidTitle + ' is not a valid role title');
          done();
        });
    });

  });

  describe('Get All Roles', () => {
    it('should return all roles', (done) => {
      // The 2 seeded Roles should be returned
      request(app)
        .get('/api/roles')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(res.body.length).toBe(2);
          done();
        });
    });

    it('getAllRoles should return the correct roles', (done) => {
      request(app)
        .get('/api/roles')
        .set('x-access-token', token)
        .end((err, res) => {
          const allRoles = res.body.map(role => role.title);
          expect(err).toBeNull();
          expect(allRoles[0]).toBe('viewer');
          expect(allRoles[1]).toBe('staff');
          done();
        });
    });

  });

});
