describe('User Spec', () => {
  'use strict';

  let helper = require('./helper');
  let request = require('supertest');
  let app = require('../index');
  let token = null;
  let Documents = require('../server/models/documents');
  let Roles = require('../server/models/roles');

  beforeEach((done) => {
    helper.beforeEach(token, (generatedToken) => {
      token = generatedToken;
      done();
    });
  });

  describe('User Creation', () => {
    it('should create a user successfully', (done) => {
      request(app)
        .post('/api/users')
        .send({
          username: 'johnSnow',
          firstname: 'John',
          lastname: 'Snow',
          email: 'snow@winterfell.org',
          password: 'knfenfenfen',
          role: Roles.schema.paths.title.default()
        })
        .set('Accept', 'application/json')
        .expect(201)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.username).toBe('johnSnow');
          expect(res.body.name.first).toBe(
            'John');
          expect(res.body.name.last).toBe(
            'Snow');
          expect(res.body.id).not.toBeNull();
          done();
        });
    });

    it('should enforce a unique username field', (done) => {
      // Try to provide a duplicate username field
      request(app)
        .post('/api/users')
        .send({
          username: 'jsnow',
          firstname: 'John',
          lastname: 'Snow',
          email: 'snow@winterfell.org',
          password: 'knfenfenfen',
          role: Roles.schema.paths.title.default()
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            'The User already exists');
          done();
        });
    });

    it('should enforce a unique email field', (done) => {
      // Try to provide a duplicate email field
      request(app)
        .post('/api/users')
        .send({
          username: 'jsnow67',
          firstname: 'John',
          lastname: 'Snow',
          email: 'jsnow@winterfell.org',
          password: 'knfenfenfen',
          role: Roles.schema.paths.title.default()
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            'The User already exists');
          done();
        });
    });

    it('should populate the user\'s role if it is not defined', (done) => {
      request(app)
        .post('/api/users')
        .send({
          username: 'newUser',
          firstname: 'John',
          lastname: 'Snow',
          email: 'snow@winterfell.org',
          password: 'knfenfenfen',
        })
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.role).not.toBeNull();
          // The role should be a string data type
          expect(res.body.role).toEqual(jasmine.any(String));
          done();
        });
    });

  });

  describe('User Documents', () => {
    it('should get a user\'s documents', (done) => {
      Documents.find({})
        .limit(1)
        .exec((err, doc) => {
          let userId = doc[0].ownerId;
          request(app)
            .get('/api/users/' + userId + '/documents')
            .expect('Content-Type', /json/)
            .set('x-access-token', token)
            .expect(200)
            .end((err, res) => {
              expect(err).toBeNull();
              // It should return the user's 3 documents
              expect(res.body.length).toBe(3);
              done();
            });
        });
    });
  });

  describe('getAllUsers function', () => {

    it('should return all users when called', (done) => {
      // The 2 seeded Roles should be returned
      request(app)
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.length).toBe(2);
          expect(res.body[0].username).toBe('jsnow');
          expect(res.body[1].username).toBe('nstark');
          done();
        });
    });
  });

});
