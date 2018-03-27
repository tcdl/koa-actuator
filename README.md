# koa-actuator
Healthcheck and monitoring middleware for koa inspired by java spring's actuators

## Installation

```
$ npm install koa-actuator --save
```

## Usage

```js
const Koa = require('koa');
const actuator = require('koa-actuator');
const app = new Koa();
//...
app.use(actuator());
//...
app.listen(3000);
```

Ones you start your koa application, it will add endpoints /health, /info

## Endpoints
The list of service endpoints and examples of responses is below:

### /health
Performs health checks and returns the results:
```
{
  "status": "UP",
  "details: {
    "db": {
      "status": "UP",
      "details": {
        "freeConnections": 10
      }
    }
    "redis": {
      "status": "UP",
      "details": {
        "usedMemory": "52m",
        "uptimeDays": 16
      }
    }
  }
}
```
The statuses of the health checks are aggregated in a root-level `status` field. If at least one check yields `DOWN` status, the aggregated status will become `DOWN`. Health checks can be defined on actuator construction:
 ```js
const healthChecks = {
  db: async () => {
    return {
      status: (await isDbAlive()) ? 'UP' : 'DOWN',
      freeConnections: await freeDbConnectionsLeft()
    }
  },
  //...
};
app.use(actuator(healthChecks));
```
A check can return an object of an arbitrary structure. If the returned structure contains `status` field, it will be counted in the aggregated status.

### /info
Main application info from package.json
```json
{
  "build": {
    "version": "1.0.0",
    "name": "koa-act-test",
    "main": "index.js",
    "description": "test"
  }
}
```