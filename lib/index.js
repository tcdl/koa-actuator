const compose = require('koa-compose');
const assert = require('assert');
const {loadPackageJson, loadGitProperties, unescape} = require('./utils');
const package_json = loadPackageJson();
const git_properties = loadGitProperties();

const HEALTH_PATH = '/health';
const INFO_PATH = '/info';

/**
 * Writes health checks results and aggregated status to response body if request path is /health
 */
function health(checks, options) {
  Object.keys(checks).forEach(name => assert(typeof(checks[name]) === 'function', `'${name}' check must be a function`));

  const timeout = options.checkTimeout || 5000;
  const HEALTH_ENDPOINT = options.actuatorPath ? options.actuatorPath + HEALTH_PATH : '/actuator' + HEALTH_PATH;

  return async function healthMiddleware(ctx, next) {
    if (HEALTH_ENDPOINT === ctx.path) {
      const health = {status: 'UP'};
      if (Object.keys(checks).length > 0) health.details = {};

      for (const checkName of Object.keys(checks)) {
        const checkResult = wrapDetails(await runCheck(checks[checkName], timeout));
        health.details[checkName] = checkResult;
        if (checkResult && checkResult.status === 'DOWN') {
          health.status = checkResult.status;
        }
      }
      ctx.status = health.status === 'UP' ? 200 : 503;
      ctx.body = health;
    } else {
      await next();
    }
  };

  function wrapDetails(checkResult) {
    const wrappedResult = {};
    for(const field of Object.keys(checkResult)) {
      if (field === 'status') {
        wrappedResult[field] = checkResult[field];
      } else {
        wrappedResult.details = wrappedResult.details || {};
        wrappedResult.details[field] = checkResult[field];
      }
    }
    return wrappedResult;
  }
}

async function runCheck(check, timeout) {
  try {
    return await Promise.race([
      check(),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('Check timed out')), timeout))
  ]);
  } catch (e) {
    return {status: 'DOWN', error: e && (e.message || e.toString())};
  }
}

/**
 * Exposes application and resources information. E.g. name, version.
 */
function info(options) {

  const INFO_ENDPOINT = options.actuatorPath ? options.actuatorPath + INFO_PATH : '/actuator' + INFO_PATH;

  return async function infoMiddleware(ctx, next) {
    if (INFO_ENDPOINT === ctx.path) {
      const infoResponseBody = {};
      if (package_json) {
        infoResponseBody.build =
          {
            version: package_json.version,
            name: package_json.name,
            main: package_json.main,
            description: package_json.description
          };
      }
      if (git_properties) {
        infoResponseBody.git =
          {
            commit: {
              time: {
                epochSecond: Math.ceil(new Date(unescape(git_properties.path().git.commit.time, /\\/g)).getTime()/1000),
                nano: 0
              },
              id: git_properties.path().git.commit.id.abbrev
            },
            branch: git_properties.path().git.branch
          };
      }

      ctx.body = infoResponseBody;
    } else {
      await next();
    }
  }
}

module.exports = (healthChecks = {}, options = {}) => {
  return compose([health(healthChecks, options), info(options)]);
};
