const path = require('path');
const appRootPath = require('app-root-path');

module.exports.requirePackageJson = function requirePackageJson() {
  return require(appRootPath + path.sep + 'package.json');
};
