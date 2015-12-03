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

  describe('Document Creation', function() {
    it('should create a document successfully', function(done) {
      request(app)
        .post('/api/documents')
        .send({
          title: 'Doc 1',
          content: 'JS Curriculum'
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(201)
        .end(function(err, res) {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.title).toBe('Doc 1');
          expect(res.body.content).toBe('JS Curriculum');
          // The timestamps should be created
          expect(res.body.dateCreated).not.toBeNull();
          expect(res.body.lastModified).not.toBeNull();
          // The User Id should be added
          expect(res.body.ownerId).not.toBeNull();
          done();
        });
    });

  });
});
