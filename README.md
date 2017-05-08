# koa-actuator
Healthcheck and monitoring middleware for koa inspired by java spring's actuators and koa-ping middleware

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
```

### /env
```
```

### /info
```
```
