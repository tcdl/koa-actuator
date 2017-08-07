const actuator = require('.');
const Koa = require('koa');
const request = require('supertest');
const assert = require('chai').assert;

describe('Koa actuator', () => {

  before(() => {
  });

  describe('/health', () => {
    it('GET should return 200 and status UP', (done) => {
      const app = new Koa();
      app.use(actuator());

      request(app.callback())
        .get('/health')
        .expect(200)
        .expect(/UP/, done);
    });

    describe('/health with custom checks', () => {

      const dbStatus = {status: 'UP', freeConnections: 10};
      const redisStatus = {status: 'UP', usedMemory: '52m', uptimeDays: 16};
      const app = new Koa();

      before(() => {
        app.use(actuator({
          checks: [
            {name: 'db', check: () => dbStatus},
            {name: 'redisStatus', check: () => redisStatus}
          ]
        }));
      });

      it('GET should return 200, custom checks and aggregated status UP', (done) => {
        request(app.callback())
          .get('/health')
          .expect(200)
          .expect({
            status: 'UP',
            db: dbStatus,
            redisStatus: redisStatus
          }, done);
      });

      it('GET should return 503, custom checks and aggregated status DOWN', (done) => {
        //arrange
        redisStatus.status = 'DOWN';

        //act & assert
        request(app.callback())
          .get('/health')
          .expect(503)
          .expect({
            status: 'DOWN',
            db: dbStatus,
            redisStatus: redisStatus
          }, done);
      });
    });
  });

  describe('/info', () => {
    it('GET should return 200 and version', (done) => {
      //arrange
      const app = new Koa();
      app.use(actuator());

      //act & assert
      request(app.callback())
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
      const app = new Koa();
      app.use(actuator());

      //act & assert
      request(app.callback())
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
      const app = new Koa();
      app.use(actuator());

      //act & assert
      request(app.callback())
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
      //arrange
      const app = new Koa();
      app.use(actuator());

      //act & assert
      request(app.callback())
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
