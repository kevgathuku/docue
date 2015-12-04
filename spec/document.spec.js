describe('Documents Spec', () => {
  'use strict';

  let request = require('supertest');
  let helper = require('./helper');
  let app = require('../index');
  let token = null;

  beforeEach((done) => {
    helper.beforeEach(token, generatedToken => {
      token = generatedToken;
      done();
    });
  });

  describe('Document Creation', () => {
    it('should create a document successfully', (done) => {
      request(app)
        .post('/api/documents')
        .send({
          title: 'Doc 1',
          content: 'JS Curriculum'
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(201)
        .end((err, res) => {
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

  describe('Document Fetching', () => {
    it('should return all documents', (done) => {
      request(app)
        .get('/api/documents')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          // Should contain all 3 seeded docs
          expect(res.body.length).toBe(3);
          done();
        });
    });

    it('should return documents in latest first order', (done) => {
      request(app)
        .get('/api/documents')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.body[0].title).toBe('Doc3');
          expect(res.body[1].title).toBe('Doc2');
          expect(res.body[2].title).toBe('Doc1');
          done();
        });
    });
  });
});
