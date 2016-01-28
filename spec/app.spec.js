describe('Application Spec', () => {
  'use strict';

  let request = require('supertest');
  let app = require('../index');

  it('should delegate absent routes to the frontend', (done) => {
    request(app)
      .get('/hows-your-father')
      .end((err, res) => {
        expect(res.statusCode).toBe(200);
        done();
      });
  });
});
