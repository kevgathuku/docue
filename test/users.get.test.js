import test from 'ava';
import request from 'supertest';

import { createTestApp } from '../index';
const helper = require('./helpers/helper');
const extractUserFromToken = require('../server/controllers/utils')
  .extractUserFromToken;

test.beforeEach('Users GET: beforeEach', async t => {
  // This runs before each test in this file
  const generatedToken = await helper.beforeEach();
  t.context.token = generatedToken;

  // Create a new user with the staff role
  const res = await request(createTestApp())
    .post('/api/users')
    .send({
      username: 'staffUser',
      firstname: 'John',
      lastname: 'Snow',
      email: 'snow@staff.org',
      password: 'staff',
      role: 'staff',
    });

  // Save the staff token
  t.context.staffToken = res.body.token;
  // Decode the user object from the token
  t.context.user = extractUserFromToken(generatedToken);
});

test.serial("should fetch the user's own profile successfully", async t => {
  const res = await request(createTestApp())
    .get('/api/users/' + t.context.user._id)
    .set('Accept', 'application/json')
    .set('x-access-token', t.context.token);

  t.is(res.statusCode, 200);
  t.is(res.body._id, t.context.user._id);
  // The password should not be returned
  t.is(res.body.password, undefined);
});

test.serial(
  "should not allow a user to fetch another user's profile",
  async t => {
    const res = await request(createTestApp())
      .get('/api/users/' + t.context.user._id)
      .set('Accept', 'application/json')
      .set('x-access-token', t.context.staffToken);

    t.is(res.statusCode, 403);
    t.is(res.body.error, 'Unauthorized Access');
  }
);
