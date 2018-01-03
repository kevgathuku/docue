describe('Documents Spec', () => {
  'use strict';

  const request = require('supertest');
  const Promise = require('bluebird');
  const helper = require('./helper');
  const app = require('../index');
  const Roles = require('../server/models/roles');
  const defaultRole = Roles.schema.paths.title.default();
  let token = null;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

  beforeEach(done => {
    // Promise that returns a generatedToken
    helper
      .beforeEach()
      .then(generatedToken => {
        token = generatedToken;
        done();
      })
      .catch(err => {
        console.log('Error running the beforeEach function', err);
        done();
      });
  });

  describe('Document Creation', () => {
    it('should create a document successfully', done => {
      request(app)
        .post('/api/documents')
        .send({
          title: 'Doc 1',
          content: 'JS Curriculum'
        })
        .set('x-access-token', token)
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

    it('should not create document if user is unauthenticated', done => {
      // Send a request without a token
      request(app)
        .post('/api/documents')
        .send({
          title: 'Doc 1',
          content: 'JS Curriculum'
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.statusCode).toBe(403);
          expect(res.body.error).toBe('No token provided.');
          done();
        });
    });

    it('should not create new document if title is missing', done => {
      // Send a request with an empty title
      request(app)
        .post('/api/documents')
        .send({
          title: '',
          content: 'JS Curriculum'
        })
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe('The document title is required');
          done();
        });
    });

    it('should not create a duplicate document', done => {
      request(app)
        .post('/api/documents')
        .send({
          title: 'Doc1',
          content: 'Duplicate document test'
        })
        .set('x-access-token', token)
        .expect(201)
        .end((err, res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.title).toBeUndefined();
          expect(res.body.error).toBe('Document already exists');
          done();
        });
    });

    it('should assign a default role if one is not defined', done => {
      request(app)
        .post('/api/documents')
        .send({
          title: 'Doc 1',
          content: 'JS Curriculum'
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(201);
          // It should assign the default role
          expect(res.body.role.title).toBe(defaultRole);
          done();
        });
    });

    it('should assign defined roles correctly', done => {
      request(app)
        .post('/api/documents')
        .send({
          title: 'Doc 1',
          content: 'JS Curriculum',
          role: 'staff'
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.role.title).toBe('staff');
          done();
        });
    });
  });

  describe('Document Fetching', () => {
    it('should return all documents', done => {
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

    it('should return documents limited by a specified number', done => {
      const limit = 2;
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

    it('should return documents in latest first order', done => {
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

  describe('Documents Update', () => {
    let documentID = null;

    beforeEach(done => {
      request(app)
        .get('/api/documents')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          // Store the first document's Id for later use
          documentID = res.body[0]._id;
          done();
        });
    });

    it('should correctly update a document', done => {
      request(app)
        .put('/api/documents/' + documentID)
        .set('x-access-token', token)
        .send({
          title: 'Brand',
          content: 'New'
        })
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          // Should contain the updated doc attributes
          expect(res.body.title).toBe('Brand');
          expect(res.body.content).toBe('New');
          done();
        });
    });
  });

  describe('Single Document Fetch', () => {
    let documentID = null;

    beforeEach(done => {
      request(app)
        .get('/api/documents')
        .set('x-access-token', token)
        .end((err, res) => {
          // Store the first document's Id for later use
          documentID = res.body[0]._id;
          done();
        });
    });

    it('should correctly fetch a single document', done => {
      request(app)
        .get('/api/documents/' + documentID)
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          // Should contain the doc's attributes
          expect(res.body.title).not.toBe(null);
          expect(res.body.content).not.toBe(null);
          done();
        });
    });
  });

  describe('Document Role Access', () => {
    let staffToken = null;
    let documentID = null;

    beforeEach(done => {
      // Create a new user with the staff role
      request(app)
        .post('/api/users')
        .send({
          username: 'staffUser',
          firstname: 'John',
          lastname: 'Snow',
          email: 'snow@staff.org',
          password: 'staff',
          role: 'staff'
        })
        .then(res => {
          staffToken = res.body.token;
          return Promise.resolve(staffToken);
        })
        .then(staffToken => {
          return request(app)
            .post('/api/documents')
            .set('x-access-token', staffToken)
            .send({
              title: 'Staff Doc',
              description: 'Confidential',
              role: 'staff'
            });
        })
        .then(res => {
          documentID = res.body._id;
          done();
        })
        .catch(err => {
          console.log('Error', err);
          done();
        });
    });

    it('should allow access to authorized users', done => {
      request(app)
        .get('/api/documents/' + documentID)
        .set('x-access-token', staffToken)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.title).not.toBe(null);
          expect(res.body.content).not.toBe(null);
          done();
        });
    });

    it('should not allow unauthorized viewing of a document', done => {
      request(app)
        .get('/api/documents/' + documentID)
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(403);
          expect(res.body.error).toBe(
            'You are not allowed to access this document'
          );
          done();
        });
    });

    it('should not allow unauthorized editing of documents', done => {
      request(app)
        .put('/api/documents/' + documentID)
        .set('x-access-token', token)
        .send({
          title: 'Users docs'
        })
        .end((err, res) => {
          expect(res.statusCode).toBe(403);
          expect(res.body.error).toBe(
            'You are not allowed to access this document'
          );
          done();
        });
    });

    it('should not allow unauthorized deletion of documents', done => {
      request(app)
        .delete('/api/documents/' + documentID)
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(403);
          expect(res.body.error).toBe(
            'You are not allowed to delete this document'
          );
          done();
        });
    });

    it('should only return documents a user is allowed to access', done => {
      request(app)
        .get('/api/documents/')
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          // Should not return the doc with the staff role
          expect(res.body.length).toBe(3);
          done();
        });
    });
  });

  describe('Document delete', () => {
    let documentID = null;

    beforeEach(done => {
      request(app)
        .get('/api/documents')
        .set('x-access-token', token)
        .end((err, res) => {
          // Store the first document's Id for later use
          documentID = res.body[0]._id;
          done();
        });
    });

    it('should correctly delete a document', done => {
      request(app)
        .delete('/api/documents/' + documentID)
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.statusCode).toBe(204);
          // should send back an empty body
          expect(res.body).toEqual({});
          done();
        });
    });
  });

  describe('Get Documents by Role', () => {
    // The viewer role (default) is the test role
    let testRole = defaultRole;

    it('should return documents accessible by the given role', done => {
      // Get the documents accessible by the test role
      request(app)
        .get('/api/documents/roles/' + testRole)
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.body.length).toBe(3);
          expect(res.body[0].role.title).toBe(testRole);
          done();
        });
    });
  });

  describe('Get Documents by Date', () => {
    let today = new Date();
    // Build the date format to be sent from the current date
    // Formt should be YYYY-MM-DD
    let testDate = `${today.getFullYear()}-${today.getMonth() +
      1}-${today.getDate()}`;
    it('should return documents created on the date provided', done => {
      request(app)
        .get('/api/documents/created/' + testDate)
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.body.length).toBe(1);
          expect(res.body[0].title).toBe('Doc1');
          done();
        });
    });

    it('should return an error if the format is not valid', done => {
      request(app)
        .get('/api/documents/created/' + '20er-343-343e3d')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe('Date must be in the format YYYY-MM-DD');
          done();
        });
    });
  });
});
