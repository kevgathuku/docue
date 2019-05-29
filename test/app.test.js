const request = require('supertest');
const app = require('../index');
import test from 'ava';

test.cb('should raise 404 error if page is not found', t => {
  request(app)
    .get('/api/hows-your-father')
    .end((err, res) => {
      t.is(res.statusCode, 404)
      t.is(res.body.error, 'Not Found')
      t.end();
    });
});
