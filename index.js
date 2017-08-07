const compose = require('koa-compose');
const os = require('os');
const path = require('path');
const appRootPath = require('app-root-path');
const package_json = require(appRootPath + path.sep + 'package.json');

const HEALTH_PATH = '/health';
const ENV_PATH = '/env';
const INFO_PATH = '/info';
const METRICS_PATH = '/metrics';
const SECURE_PROP_NAMES = ['admin', 'user', 'password', 'pass', 'pwd', 'login', 'username'];

/**
 * Writes {status: 'UP'} to response body if request path is /health
 */
function health(options) {
  let checks = [];
  if (options && options.checks.constructor === Array) {
    checks = options.checks.filter((check) => check && check.name && typeof(check.check) === 'function');
  }
  return async function (ctx, next) {
    if (HEALTH_PATH === ctx.path) {
      const health = {status: 'UP'};
      for (let check of checks) {
        const checkResult = await check.check();
        if (typeof(checkResult) !== 'undefined' && checkResult !== null) {
          health[check.name] = checkResult;
          if (checkResult.status === 'DOWN') {
            health.status = checkResult.status;
          }
        }
      }
      ctx.status = health.status === 'UP' ? 200 : 503;
      ctx.body = health;
    } else
      await next();
  }
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
    const envCopy = Object.assign({}, process.env);
    Object
      .keys(envCopy)
      .filter(property => {
        const propLowerCase = property.toLowerCase();
        return SECURE_PROP_NAMES.some(p => propLowerCase.includes(p));
      })
      .forEach(property => envCopy[property] = '*******'); //hide secure details
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
      'heap.used': memory.heapUsed,
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


module.exports = (options) => {
  return compose([health(options && options.health), env, info, metrics]);
};
