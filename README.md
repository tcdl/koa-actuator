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
...
app.use(actuator);
...
app.listen(3000);
```

Ones you start your koa application, it will add several service endpoints such as /health, /env, etc.

## Endpoints
The list of service endpoints and examples of responses is below:

### /health
```
{"status":"UP"}
```

### /env
Exposes environment properties and command line arguments. Variables that likely to be secure (contain 'user', 'password', 'pass' etc in their names) will be replaced by *******
```json
{
  "systemEnvironment": {
    "OLDPWD": "*******",
    "NVM_DIR": "/Users/yyyy/.nvm",
    "USER": "*******",
    "NVM_BIN": "/Users/yyyy/.nvm/versions/node/v7.9.0/bin",
    "HTTP_PORT": "3000"
  },
  "arguments": [
    "/Users/yyyy/.nvm/versions/node/v7.9.0/bin/node",
    "/Users/yyyy/nodeProjects/koa-act-test/index",
    "myarg=test"
  ]
}
```

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

### /metrics
```json
{
  "timestamp": 1494242326200,
  "uptime": 8.017,
  "processors": 8,
  "heap": 10403840,
  "heap.used": 7057224,
  "resources": {
    "memory": {
      "rss": 27021312,
      "heapTotal": 10403840,
      "heapUsed": 7057224,
      "external": 43578
    },
    "loadavg": [
      1.89794921875,
      1.7880859375,
      1.75634765625
    ],
    "cpu": "...",
    "nics": "..."
  }
}
```