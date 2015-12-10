describe('Documents Spec', () => {
  'use strict';

  let request = require('supertest');
  let helper = require('./helper');
  let app = require('../index');
  let Roles = require('../server/models/roles');
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

    it('should not create document if user is unauthenticated', (done) => {
      // Send a request without a token
      request(app)
        .post('/api/documents')
        .send({
          title: 'Doc 1',
          content: 'JS Curriculum'
        })
        .set('Accept', 'application/json')
        .expect(201)
        .end((err, res) => {
          expect(err).not.toBeNull();
          expect(res.statusCode).toBe(403);
          expect(res.body.error).toBe('No token provided.');
          done();
        });
    });

    it('should not create new document if title is missing', (done) => {
      // Send a request with an empty title
      request(app)
        .post('/api/documents')
        .send({
          title: '',
          content: 'JS Curriculum'
        })
        .set('x-access-token', token)
        .expect(201)
        .end((err, res) => {
          expect(err).not.toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            'The document title is required');
          done();
        });
    });

    it('should assign a default role if one is not defined', (done) => {
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
          expect(res.body.roles.length).toBe(1);
          expect(res.body.roles[0].title).toBe(
            Roles.schema.paths.title.default());
          done();
        });
    });

    it('should assign defined roles correctly', (done) => {
      request(app)
        .post('/api/documents')
        .send({
          title: 'Doc 1',
          content: 'JS Curriculum',
          roles: 'staff, viewer'
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(201)
        .end((err, res) => {
          let roleTitles = res.body.roles.map(titleObj =>
            titleObj.title);
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.roles.length).toBe(2);
          expect(roleTitles).toContain('staff');
          expect(roleTitles).toContain('viewer');
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

    it('should return documents limited by a specified number', (
      done) => {
      let limit = 2;
      request(app)
        .get('/api/documents?limit=' + limit)
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          // Should return only the specified number of documents
          expect(res.body.length).toBe(limit);
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

  describe('Get Documents by Role', () => {

  });
});
