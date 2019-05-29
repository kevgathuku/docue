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

test.serial('should create a document successfully', async t => {
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

test.serial(
  'should not create document if user is unauthenticated',
  async t => {
    // Send a request without a token
    const res = await request(createTestApp())
      .post('/api/documents')
      .send({
        title: 'Doc 1',
        content: 'JS Curriculum',
      })
      .set('Accept', 'application/json');

    t.is(res.statusCode, 403);
    t.is(res.body.error, 'No token provided.');
  }
);

test.serial('should not create new document if title is missing', async t => {
  // Send a request with an empty title
  const res = await request(createTestApp())
    .post('/api/documents')
    .set('x-access-token', t.context.token)
    .send({
      title: '',
      content: 'JS Curriculum',
    });

  t.is(res.statusCode, 400);
  t.is(res.body.error, 'The document title is required');
});

test.serial('should not create a duplicate document', async t => {
  const res = await request(createTestApp())
    .post('/api/documents')
    .set('x-access-token', t.context.token)
    .send({
      title: 'Doc1',
      content: 'Duplicate document test',
    });

  t.is(res.statusCode, 400);
  t.is(res.body.title, undefined);
  t.is(res.body.error, 'Document already exists');
});

test.serial('should assign a default role if one is not defined', async t => {
  const res = await request(createTestApp())
    .post('/api/documents')
    .send({
      title: 'Doc 1',
      content: 'JS Curriculum'
    })
    .set('Accept', 'application/json')
    .set('x-access-token', t.context.token)

    t.is(res.statusCode, 201);
    // It should assign the default role
    t.is(res.body.role.title, defaultRole);
});

test.serial('should assign defined roles correctly', async t => {
  const res = await request(createTestApp())
    .post('/api/documents')
    .send({
      title: 'Doc 1',
      content: 'JS Curriculum',
      role: 'staff'
    })
    .set('Accept', 'application/json')
    .set('x-access-token', t.context.token)

    t.is(res.statusCode, 201);
    t.is(res.body.role.title, 'staff');
});
