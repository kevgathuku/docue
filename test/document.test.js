import test from 'ava';
import request from 'supertest';

const helper = require('./helpers/helper');
import { createTestApp } from '../index';
const Roles = require('../server/models/roles');
const defaultRole = Roles.schema.paths.title.default();

test.beforeEach('Document: beforeEach', async t => {
  // This runs before each test
  const generatedToken = await helper.beforeEach();
  t.context.token = generatedToken;
});

test('should create a document successfully', async t => {
  const res = await request(createTestApp())
    .post('/api/documents')
    .set('x-access-token', t.context.token)
    .send({
      title: 'Doc 1',
      content: 'JS Curriculum',
    });

  t.is(res.statusCode, 201);

  // expect(res.body.title).toBe('Doc 1');
  t.is(res.body.title, 'Doc 1');
  t.is(res.body.content, 'JS Curriculum');

  // The timestamps should be created
  t.truthy(res.body.dateCreated);
  t.truthy(res.body.lastModified);

  // The User Id should be added
  t.truthy(res.body.ownerId);
});

test('should not create document if user is unauthenticated', async t => {
  // Send a request without a token
  const res = await request(createTestApp())
    .post('/api/documents')
    .send({
      title: 'Doc 1',
      content: 'JS Curriculum',
    })
    .set('Accept', 'application/json')

    t.is(res.statusCode, 403);
    t.is(res.body.error, 'No token provided.');
});

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
