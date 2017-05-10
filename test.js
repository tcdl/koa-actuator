const actuator = require('.');
const Koa = require('koa');
const supertest = require('supertest');
const assert = require('chai').assert;
const app = new Koa();

describe('Koa actuator', () => {

  let request;

  before(() => {
    app.use(actuator);
    request = supertest.agent(app.listen());
  });

  describe('/health', () => {
    it('GET should return 200 and status UP', (done) => {
      request
        .get('/health')
        .expect(200)
        .expect(/UP/, done);
    });
  });

  describe('/info', () => {
    it('GET should return 200 and version', (done) => {
      request
        .get('/info')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          assert.isDefined(res.body.build.version);
          done();
        });
    });
  });

  describe('/env', () => {
    it('GET should return 200 and the list of environment variables', (done) => {
      //arrange
      process.env.TEST_VAR = 'test';

      //act & assert
      request
        .get('/env')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.systemEnvironment.TEST_VAR, 'test');
          done();
        });
    });

    it('should hide secure data', (done) => {
      //arrange
      process.env.TEST_VAR = 'test';
      process.env.USERNAME = 'test-username';
      process.env.PASSWORD = 'test-password';

      //act & assert
      request
        .get('/env')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.systemEnvironment.TEST_VAR, 'test');
          assert.equal(res.body.systemEnvironment.USERNAME, '*******');
          assert.equal(res.body.systemEnvironment.PASSWORD, '*******');
          done();
        });
    });
  });

  describe('/metrics', () => {
    it('should return 200 and show some service info (like uptime, heap usage etc)', (done) => {
      //act & assert
      request
        .get('/metrics')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          assert.property(res.body, 'uptime');
          assert.property(res.body, 'processors');
          assert.property(res.body, 'heap');
          assert.property(res.body, 'heap.used');
          assert.deepProperty(res.body, 'resources.memory');
          done();
        });
    });
  });
});