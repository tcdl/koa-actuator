const path = require('path');
const appRootPath = require('app-root-path');

module.exports.loadPackageJson = function loadPackageJson() {
  try {
    return require(appRootPath + path.sep + 'package.json');
  } catch (e) {
    try {
      return require(process.cwd() + path.sep + 'package.json');
    } catch (e) {
      try {
        return require('../../../package.json');
      } catch (e) {
        return null;
      }
    }
  }
};
