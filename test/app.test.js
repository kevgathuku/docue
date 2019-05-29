import request from 'supertest';
import test from 'ava';
import { createTestApp } from '../index';

test.cb('should raise 404 error if page is not found', t => {
  t.plan(2);
  request(createTestApp())
    .get('/api/hows-your-father')
    .end((err, res) => {
      t.is(res.statusCode, 404);
      t.is(res.body.error, 'Not Found');
      t.end();
    });
});
