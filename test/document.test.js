import test from 'ava';

const request = require('supertest');
const Promise = require('bluebird');
const helper = require('./helpers/helper');
const app = require('../index');
const Roles = require('../server/models/roles');
const defaultRole = Roles.schema.paths.title.default();
let token = null;

test.beforeEach.cb(t => {
  // This runs before each test
  helper
    .beforeEach()
    .then(generatedToken => {
      token = generatedToken;
      // done();
      t.end();
    })
    .catch(err => {
      console.error('Error running the beforeEach function', err);
      // done();
      t.end();
    });
});

test.cb('should create a document successfully', t => {
  request(app)
    .post('/api/documents')
    .send({
      title: 'Doc 1',
      content: 'JS Curriculum',
    })
    .set('x-access-token', token)
    .end((err, res) => {
      t.is(err, null);
      t.is(res.statusCode, 201);

      // expect(res.body.title).toBe('Doc 1');
      t.is(res.body.title, 'Doc 1');
      t.is(res.body.content, 'JS Curriculum');

      // The timestamps should be created
      t.truthy(res.body.dateCreated);
      t.truthy(res.body.lastModified);

      // The User Id should be added
      t.truthy(res.body.ownerId);
      t.end();
    });
});

// it('should not create document if user is unauthenticated', done => {
//   // Send a request without a token
//   request(app)
//     .post('/api/documents')
//     .send({
//       title: 'Doc 1',
//       content: 'JS Curriculum'
//     })
//     .set('Accept', 'application/json')
//     .end((err, res) => {
//       expect(res.statusCode).toBe(403);
//       expect(res.body.error).toBe('No token provided.');
//       done();
//     });
// });

// it('should not create new document if title is missing', done => {
//   // Send a request with an empty title
//   request(app)
//     .post('/api/documents')
//     .send({
//       title: '',
//       content: 'JS Curriculum'
//     })
//     .set('x-access-token', token)
//     .end((err, res) => {
//       expect(res.statusCode).toBe(400);
//       expect(res.body.error).toBe('The document title is required');
//       done();
//     });
// });

// it('should not create a duplicate document', done => {
//   request(app)
//     .post('/api/documents')
//     .send({
//       title: 'Doc1',
//       content: 'Duplicate document test'
//     })
//     .set('x-access-token', token)
//     .expect(201)
//     .end((err, res) => {
//       expect(res.statusCode).toBe(400);
//       expect(res.body.title).toBeUndefined();
//       expect(res.body.error).toBe('Document already exists');
//       done();
//     });
// });

// it('should assign a default role if one is not defined', done => {
//   request(app)
//     .post('/api/documents')
//     .send({
//       title: 'Doc 1',
//       content: 'JS Curriculum'
//     })
//     .set('Accept', 'application/json')
//     .set('x-access-token', token)
//     .end((err, res) => {
//       expect(res.statusCode).toBe(201);
//       // It should assign the default role
//       expect(res.body.role.title).toBe(defaultRole);
//       done();
//     });
// });

// it('should assign defined roles correctly', done => {
//   request(app)
//     .post('/api/documents')
//     .send({
//       title: 'Doc 1',
//       content: 'JS Curriculum',
//       role: 'staff'
//     })
//     .set('Accept', 'application/json')
//     .set('x-access-token', token)
//     .end((err, res) => {
//       expect(err).toBeNull();
//       expect(res.statusCode).toBe(201);
//       expect(res.body.role.title).toBe('staff');
//       done();
//     });
// });
