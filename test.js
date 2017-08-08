const actuator = require('.');
const Koa = require('koa');
const request = require('supertest');
const assert = require('chai').assert;

describe('koa-actuator', () => {

  describe('/health', () => {
    it('should return 200 and status UP if no checks defined', (done) => {
      //arrange
      const app = new Koa();
      app.use(actuator());

      //act & assert
      request(app.callback())
        .get('/health')
        .expect(200)
        .expect({status: 'UP'}, done);
    });

    it('should return 200 and status UP if sync and async checks pass', (done) => {
      //arrange
      const app = new Koa();
      app.use(actuator({
        health: {
          checks: [
            {name: 'db', check: () => Promise.resolve({status: 'UP', freeConnections: 10})},
            {name: 'redis', check: () => ({status: 'UP', usedMemory: '52m', uptimeDays: 16})}
          ]
        }
      }));

      //act & assert
      request(app.callback())
        .get('/health')
        .expect(200)
        .expect({
          status: 'UP',
          db: {status: 'UP', freeConnections: 10},
          redis: {status: 'UP', usedMemory: '52m', uptimeDays: 16}
        }, done);
    });

    it('should return 503 and status DOWN if any check fails', (done) => {
      //arrange
      const app = new Koa();
      app.use(actuator({
        health: {
          checks: [
            {name: 'db', check: () => Promise.resolve({status: 'UP', freeConnections: 10})},
            {name: 'redis', check: () => Promise.resolve({status: 'DOWN', usedMemory: '52m', uptimeDays: 16})}
          ]
        }
      }));

      //act & assert
      request(app.callback())
        .get('/health')
        .expect(503)
        .expect({
          status: 'DOWN',
          db: {status: 'UP', freeConnections: 10},
          redis: {status: 'DOWN', usedMemory: '52m', uptimeDays: 16}
        }, done);
    });

    it('should return 503 and status DOWN if a sync check throws exception', (done) => {
      //arrange
      const app = new Koa();
      app.use(actuator({
        health: {
          checks: [
            {name: 'db', check: () => { throw new Error('unexpected error'); }},
            {name: 'redis', check: () => Promise.resolve({status: 'UP', usedMemory: '52m', uptimeDays: 16})}
          ]
        }
      }));

      //act & assert
      request(app.callback())
        .get('/health')
        .expect(503)
        .expect({
          status: 'DOWN',
          db: {status: 'DOWN', error: 'unexpected error'},
          redis: {status: 'UP', usedMemory: '52m', uptimeDays: 16}
        }, done);
    });

    it('should return 503 and status DOWN if an async check rejects promise', (done) => {
      //arrange
      const app = new Koa();
      app.use(actuator({
        health: {
          checks: [
            {name: 'db', check: () => Promise.resolve({status: 'UP', freeConnections: 10})},
            {name: 'redis', check: () => Promise.reject('unexpected async error')},
          ]
        }
      }));

      //act & assert
      request(app.callback())
        .get('/health')
        .expect(503)
        .expect({
          status: 'DOWN',
          db: {status: 'UP', freeConnections: 10},
          redis: {status: 'DOWN', error: 'unexpected async error'}
        }, done);
    });

    it('should return 503 and status DOWN if an async check times out', (done) => {
      //arrange
      const app = new Koa();
      app.use(actuator({
        health: {
          checks: [
            {name: 'db', check: () => new Promise((resolve, reject) => setTimeout(() => resolve({status: 'UP', freeConnections: 10}), 3000))}
          ],
          timeout: 100
        }
      }));

      //act & assert
      request(app.callback())
        .get('/health')
        .expect(503)
        .expect({
          status: 'DOWN',
          db: {status: 'DOWN', error: 'Check timed out'},
        }, done);
    });
  });

  describe('/info', () => {
    it('should return 200 and version', (done) => {
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
    it('should return 200 and the list of environment variables', (done) => {
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
