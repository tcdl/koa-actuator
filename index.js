const compose = require('koa-compose');
const {health, env, info, metrics} = require('./lib/endpoints');

module.exports = (healthChecks = {}, options = {}) => {
  return compose([health(healthChecks, options), env, info, metrics]);
};
