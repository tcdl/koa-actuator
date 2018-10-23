const path = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');
const PropertiesReader = require('properties-reader');

module.exports.loadPackageJson = function loadPackageJson() {
  const pathToPackageJson = findFilePathInProjectRootDir('package.json');
  if (!pathToPackageJson)
    return null;
  try {
    return require(pathToPackageJson);
  } catch (e) {
    return null;
  }
};

module.exports.loadGitProperties = function loadGitProperties() {
  const pathToGitProperties = findFilePathInProjectRootDir('git.properties');
  return pathToGitProperties ? new PropertiesReader(pathToGitProperties) : null;
};

module.exports.unescape = function unescape(str, symbols) {
  return str ? str.replace(symbols, '') : '';
};

/**
 * The function tries to find the file with the given name in apps root dir.
 * @param fileName - end file name, e.g. 'package.json'
 * @returns path to found file or null;
 */
function findFilePathInProjectRootDir(fileName) {
  const pathsToSearchIn = [
    appRootPath + path.sep + fileName,
    process.cwd() + path.sep + fileName,
    path.resolve(__dirname + '/../../../' + fileName)
  ];
  for (let idx in pathsToSearchIn) {
    const filePath = pathsToSearchIn[idx];
    if (fs.existsSync(filePath))
      return filePath;
  }
  return null;
}
