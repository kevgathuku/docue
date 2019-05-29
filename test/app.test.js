import request from 'supertest';
import test from 'ava';
import { createTestApp } from '../index';

test('should raise 404 error if page is not found', async t => {
  const res = await request(createTestApp()).get('/api/hows-your-father');

  t.is(res.statusCode, 404);
  t.is(res.body.error, 'Not Found');
});
