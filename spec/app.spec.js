describe('Application Spec', () => {
  'use strict';

  let request = require('supertest');
  let app = require('../index');

  it('should raise 404 error if page is not found', (done) => {
    request(app)
      .get('/hows-your-father')
      .end((err, res) => {
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Not Found');
        done();
      });
  });
});
