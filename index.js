const compose = require('koa-compose');
const os = require('os');
const path = require('path');
const appRootPath = require('app-root-path');
const package_json = require(appRootPath + path.sep +'package.json');

const HEALTH_PATH = '/health';
const ENV_PATH = '/env';
const INFO_PATH = '/info';
const METRICS_PATH = '/metrics';
const SECURE_PROP_NAMES = ['admin', 'user', 'password', 'pass', 'pwd', 'login', 'username'];

/**
 * Writes {status: 'UP'} to response body if request path is /health
 */
async function health(ctx, next) {
  if (HEALTH_PATH == ctx.path)
    ctx.body = {status: 'UP'};
  else
    await next();
}

/**
 * Exposes application and resources information. E.g. name, version.
 */
async function info(ctx, next) {
  if (INFO_PATH == ctx.path)
    ctx.body = {build:
      {
        version: package_json.version,
        name: package_json.name,
        main: package_json.main,
        description: package_json.description
      }
    };
  else
    await next();
}

/**
 * Exposes environment properties. Secure variables (such as 'user', 'password', 'pass' etc are) values will be hidden.
 */
async function env(ctx, next) {
  if (ENV_PATH == ctx.path) {
    const envCopy = JSON.parse(JSON.stringify(process.env)); //deep copy
    Object
      .keys(envCopy)
      .filter(property => {
        const propLowerCase = property.toLowerCase();
        for(let i in SECURE_PROP_NAMES) {
          if (propLowerCase.includes(SECURE_PROP_NAMES[i]))
            return true;
        }
        return false;
      })
      .forEach(property => {envCopy[property] = '*******'}); //hide secure details
    ctx.body = {systemEnvironment: envCopy, arguments: process.argv};
  } else {
    await next();
  }
}

/**
 * Exposes application and resources information. E.g. name, version, memory and CPU usage
 */
async function metrics(ctx, next) {
  if (METRICS_PATH == ctx.path) {
    const memory = process.memoryUsage();
    ctx.body = {
      timestamp: Date.now(),
      uptime: process.uptime(),
      processors: os.cpus().length,
      heap: memory.heapTotal,
      "heap.used": memory.heapUsed,
      resources: {
        memory: memory,
        loadavg: os.loadavg(),
        cpu: JSON.stringify(os.cpus()),
        nics: JSON.stringify(os.networkInterfaces())
      }
    };
  } else {
    await next();
  }
}


module.exports = compose([health, env, info, metrics]);