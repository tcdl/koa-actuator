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
    "MANPATH": "/Users/yyyy/.nvm/versions/node/v7.9.0/share/man:/usr/local/share/man/ru:/usr/local/share/man:/usr/share/man:/Library/Developer/CommandLineTools/usr/share/man",
    "TERM_PROGRAM": "iTerm.app",
    "NVM_CD_FLAGS": "",
    "TERM": "xterm-256color",
    "SHELL": "/bin/bash",
    "TMPDIR": "/var/folders/d8/68wp2qq94gg7czq1hwtmx8c80000gn/T/",
    "Apple_PubSub_Socket_Render": "/private/tmp/com.apple.launchd.tLwMgDm0AV/Render",
    "TERM_PROGRAM_VERSION": "3.0.15",
    "OLDPWD": "*******",
    "TERM_SESSION_ID": "w0t1p0:72377824-7E6A-4A4D-BC2A-58365A440FD6",
    "NVM_DIR": "/Users/yyyy/.nvm",
    "USER": "*******",
    "SSH_AUTH_SOCK": "/private/tmp/com.apple.launchd.cHkygZqkG8/Listeners",
    "__CF_USER_TEXT_ENCODING": "*******",
    "PATH": "/Users/yyyy/.nvm/versions/node/v7.9.0/bin:/Library/Frameworks/Python.framework/Versions/3.4/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/opt/glassfish/libexec/bin:./node_modules/.bin",
    "NVM_NODEJS_ORG_MIRROR": "https://nodejs.org/dist",
    "PWD": "*******",
    "ITERM_PROFILE": "guake",
    "XPC_FLAGS": "0x0",
    "XPC_SERVICE_NAME": "0",
    "SHLVL": "1",
    "HOME": "/Users/yyyy",
    "COLORFGBG": "15;0",
    "ITERM_SESSION_ID": "w0t1p0:72377824-7E6A-4A4D-BC2A-58365A440FD6",
    "LOGNAME": "yyyy",
    "NVM_BIN": "/Users/yyyy/.nvm/versions/node/v7.9.0/bin",
    "NVM_IOJS_ORG_MIRROR": "https://iojs.org/dist",
    "_": "/Users/yyyy/.nvm/versions/node/v7.9.0/bin/node",
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
    "cpu": "[{\"model\":\"Intel(R) Core(TM) i7-4750HQ CPU @ 2.00GHz\",\"speed\":2000,\"times\":{\"user\":20302870,\"nice\":0,\"sys\":15303310,\"idle\":196280270,\"irq\":0}},{\"model\":\"Intel(R) Core(TM) i7-4750HQ CPU @ 2.00GHz\",\"speed\":2000,\"times\":{\"user\":1334050,\"nice\":0,\"sys\":1123370,\"idle\":229418920,\"irq\":0}},{\"model\":\"Intel(R) Core(TM) i7-4750HQ CPU @ 2.00GHz\",\"speed\":2000,\"times\":{\"user\":15541710,\"nice\":0,\"sys\":7719240,\"idle\":208619640,\"irq\":0}},{\"model\":\"Intel(R) Core(TM) i7-4750HQ CPU @ 2.00GHz\",\"speed\":2000,\"times\":{\"user\":1431950,\"nice\":0,\"sys\":1243590,\"idle\":229199470,\"irq\":0}},{\"model\":\"Intel(R) Core(TM) i7-4750HQ CPU @ 2.00GHz\",\"speed\":2000,\"times\":{\"user\":15553330,\"nice\":0,\"sys\":7725550,\"idle\":208600260,\"irq\":0}},{\"model\":\"Intel(R) Core(TM) i7-4750HQ CPU @ 2.00GHz\",\"speed\":2000,\"times\":{\"user\":1432460,\"nice\":0,\"sys\":1238880,\"idle\":229202350,\"irq\":0}},{\"model\":\"Intel(R) Core(TM) i7-4750HQ CPU @ 2.00GHz\",\"speed\":2000,\"times\":{\"user\":15533090,\"nice\":0,\"sys\":7709770,\"idle\":208634870,\"irq\":0}},{\"model\":\"Intel(R) Core(TM) i7-4750HQ CPU @ 2.00GHz\",\"speed\":2000,\"times\":{\"user\":1437380,\"nice\":0,\"sys\":1249570,\"idle\":229185550,\"irq\":0}}]",
    "nics": "{\"lo0\":[{\"address\":\"::1\",\"netmask\":\"ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff\",\"family\":\"IPv6\",\"mac\":\"00:00:00:00:00:00\",\"scopeid\":0,\"internal\":true},{\"address\":\"127.0.0.1\",\"netmask\":\"255.0.0.0\",\"family\":\"IPv4\",\"mac\":\"00:00:00:00:00:00\",\"internal\":true}]}"
  }
}
```