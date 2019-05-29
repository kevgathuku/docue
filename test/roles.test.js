import test from 'ava';
import request from 'supertest';

const helper = require('./helpers/helper');
import { createTestApp } from '../index';

test.beforeEach('Roles: beforeEach', async t => {
  // This runs before each test
  const generatedToken = await helper.beforeEach();
  t.context.token = generatedToken;
});

test.serial('should create a role successfully', async t => {
  // Try to create an allowed but non-existent role
  const res = await request(createTestApp())
    .post('/api/roles')
    .send({
      title: 'admin',
    })
    .set('Accept', 'application/json')
    .set('x-access-token', t.context.token);

  t.is(res.statusCode, 201);
  t.is(res.body.title, 'admin');
  // Should assign the accessLevel correctly
  t.is(res.body.accessLevel, 2);
  t.truthy(res.body._id);
});

test.serial('should not create a role without a title', async t => {
  const res = await request(createTestApp())
    .post('/api/roles')
    .send({
      title: '',
    })
    .set('Accept', 'application/json')
    .set('x-access-token', t.context.token);

  t.is(res.statusCode, 400);
  t.is(res.body.error, 'The role title is required');
});

test.serial('should not create a duplicate role', async t => {
  // Try to create a duplicate role
  const res = await request(createTestApp())
    .post('/api/roles')
    .send({
      title: 'viewer',
    })
    .set('Accept', 'application/json')
    .set('x-access-token', t.context.token);

  t.is(res.statusCode, 400);
  t.is(res.body.title, undefined);
  t.is(res.body.error, 'Role already exists');
});

test.serial(
  'should not create a role if the user is unauthenticated',
  async t => {
    // Try to send a request without a token
    const res = await request(createTestApp())
      .post('/api/roles')
      .set('Accept', 'application/json')
      .send({
        title: 'viewer',
      });

    t.is(res.statusCode, 403);
    t.is(res.body.error, 'No token provided.');
  }
);

test.serial('should not create an invalid role', async t => {
  const invalidTitle = 'invalid title';
  const res = await request(createTestApp())
    .post('/api/roles')
    .send({
      title: invalidTitle,
    })
    .set('Accept', 'application/json')
    .set('x-access-token', t.context.token);

  t.is(res.statusCode, 400);
  t.is(res.body.error, `${invalidTitle} is not a valid role title`);
});

test.serial('should return all roles', async t => {
  // The 2 seeded Roles should be returned
  const res = await request(createTestApp())
    .get('/api/roles')
    .set('x-access-token', t.context.token)
    .set('Accept', 'application/json');

  t.is(res.statusCode, 200);
  t.is(res.body.length, 2);
});

test.serial('getAllRoles should return the correct roles', async t => {
  const res = await request(createTestApp())
    .get('/api/roles')
    .set('x-access-token', t.context.token);

  const allRoles = res.body.map(role => role.title);
  t.is(allRoles[0], 'viewer');
  t.is(allRoles[1], 'staff');
});
