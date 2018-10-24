const Koa = require('koa');
const request = require('supertest');
const utils = require('../lib/utils');
const assert = require('chai').assert;
const sinon = require('sinon');
const fs = require('fs');
const {copyFileSync} = require('./utils');
const actuator = require('../lib/index');

describe('koa-actuator', () => {

  let app;
  let server;

  beforeEach(() => {
    app = new Koa();
    server = app.listen();
  });

  afterEach(() => server.close());

  describe('/health', () => {
    it('should return 200 and status UP if no checks defined', (done) => {
      //arrange
      app.use(actuator());

      //act & assert
      request(server)
        .get('/actuator/health')
        .expect(200)
        .expect({status: 'UP'}, done);
    });

    it('should use parameter actuatorPath if it is defined', (done) => {

      const options = {actuatorPath: '/custom-actuator-path'};

      app.use(actuator({}, options));

      request(server)
        .get('/custom-actuator-path/health')
        .expect(200)
        .expect({status: 'UP'}, done);
    });

    it('should return 200 and status UP if sync and async checks pass', (done) => {
      //arrange
      app.use(actuator({
        db: () => Promise.resolve({status: 'UP', freeConnections: 10}),
        redis: () => ({status: 'UP', usedMemory: '52m', uptimeDays: 16})
      }));

      //act & assert
      request(server)
        .get('/actuator/health')
        .expect(200)
        .expect({
          status: 'UP',
          details: {
            db: {status: 'UP', details: {freeConnections: 10}},
            redis: {status: 'UP', details: {usedMemory: '52m', uptimeDays: 16}}
          }
        }, done);
    });

    it('should return 503 and status DOWN if any check fails', (done) => {
      //arrange
      app.use(actuator({
        db: () => Promise.resolve({status: 'UP', freeConnections: 10}),
        redis: () => Promise.resolve({status: 'DOWN', usedMemory: '52m', uptimeDays: 16})
      }));

      //act & assert
      request(server)
        .get('/actuator/health')
        .expect(503)
        .expect({
          status: 'DOWN',
          details: {
            db: {status: 'UP', details: {freeConnections: 10}},
            redis: {status: 'DOWN', details:{usedMemory: '52m', uptimeDays: 16}}
          }
        }, done);
    });

    it('should return 503 and status DOWN if a sync check throws exception', (done) => {
      //arrange
      app.use(actuator({
        db: () => {
          throw new Error('unexpected error');
        },
        redis: () => Promise.resolve({status: 'UP', usedMemory: '52m', uptimeDays: 16})
      }));

      //act & assert
      request(server)
        .get('/actuator/health')
        .expect(503)
        .expect({
          status: 'DOWN',
          details: {
            db: {status: 'DOWN', details: {error: 'unexpected error'}},
            redis: {status: 'UP', details: {usedMemory: '52m', uptimeDays: 16}}
          }
        }, done);
    });

    it('should return 503 and status DOWN if an async check rejects promise', (done) => {
      //arrange
      app.use(actuator({
        db: () => Promise.resolve({status: 'UP', freeConnections: 10}),
        redis: () => Promise.reject('unexpected async error')
      }));

      //act & assert
      request(server)
        .get('/actuator/health')
        .expect(503)
        .expect({
          status: 'DOWN',
          details: {
            db: {status: 'UP', details: {freeConnections: 10}},
            redis: {status: 'DOWN', details: {error: 'unexpected async error'}}
          }
        }, done);
    });

    it('should return 503 and status DOWN if an async check times out', (done) => {
      //arrange
      const options = {checkTimeout: 100};
      app.use(actuator({
        db: () => new Promise((resolve, reject) => setTimeout(() => resolve({status: 'UP', freeConnections: 10}), 3000))
      }, options));

      //act & assert
      request(server)
        .get('/actuator/health')
        .expect(503)
        .expect({
          status: 'DOWN',
          details: {
            db: {status: 'DOWN', details: {error: 'Check timed out'}}
          }
        }, done);
    });
  });

  describe('/info', () => {
    let sandbox;

    before(() => {
      sandbox = sinon.sandbox.create();
    });

    after(() => {
      sandbox.restore();
    });

    describe('build info', () => {
      it('should return 200 and version', (done) => {
        //arrange
        app.use(actuator());

        //act & assert
        request(server)
          .get('/actuator/info')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            assert.isDefined(res.body.build.version);
            done();
          });
      });

      it('should use parameter actuatorPath if it is defined', (done) => {
        //arrange
        const options = {actuatorPath: '/custom-actuator-path'};

        app.use(actuator({}, options));

        //act & assert
        request(server)
          .get('/custom-actuator-path/info')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            assert.isDefined(res.body.build.version);
            done();
          });
      });


      it('should return 200 and empty object if package.json not found', (done) => {
        //arrange
        sinon.stub(utils, 'loadPackageJson').returns(null);
        delete require.cache[require.resolve('../lib/index')];
        const actuator = require('../lib/index');

        app.use(actuator());

        //act & assert
        request(server)
          .get('/actuator/info')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            assert.deepEqual(res.body, {});
            done();
          });
      });
    });

    describe('git info', () => {
      let actuator;

      //copy git.properties file to app root dir and delete the app from require cache in order to re-read properties file
      before((done)=>{
        copyFileSync('./test/git.properties.example', './git.properties');
        delete require.cache[require.resolve('../lib/index')];
        actuator = require('../lib/index');
        done();
      });

      after((done) => {
        fs.unlink('./git.properties', done);
      });

      it('should expose git-related info if git.properties file is present', (done) => {
        //arrange
        app.use(actuator());

        //act & assert
        request(server)
          .get('/actuator/info')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            assert.equal(res.body.git.commit.id, 'a94ff08');
            assert.equal(res.body.git.branch, 'master');
            assert.equal(res.body.git.commit.time.epochSecond, 1531473434);
            done();
          });
      });
    });
  });

});
