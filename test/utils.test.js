const appRootPath = require('app-root-path');
const path = require('path');
const mock = require('mock-require');
const sinon = require('sinon');
const fs = require('fs');
const {assert} = require('chai');

describe('utils', () => {
  describe('loadPackageJson', () => {
    const sandbox = sinon.createSandbox();
    after(() => {
      mock.stopAll();
    });

    afterEach(() => {sandbox.restore();});

    it('should require package.json using app-root-path', () => {
      const mockedPackageJson = {description: 'package.json from app-root-path'};
      mock(appRootPath + path.sep + 'package.json', mockedPackageJson);
      const utils = mock.reRequire('../lib/utils');

      assert.deepEqual(utils.loadPackageJson(), mockedPackageJson)
    });

    it('should require package.json from CWD if app-root-path fails', () => {
      const mockedPackageJson = {description: 'package.json from CWD'};
      mock(appRootPath + path.sep + 'package.json', 'not_exiting');
      mock(process.cwd() + path.sep + 'package.json', mockedPackageJson);
      const utils = mock.reRequire('../lib/utils');

      assert.deepEqual(utils.loadPackageJson(), mockedPackageJson)
    });

    it('should require package.json from relative path if CWD fails', () => {
      sandbox.stub(fs, 'existsSync').withArgs('../../../package.json').returns(true);
      const mockedPackageJson = {description: 'package.json from relative path'};
      mock(appRootPath + path.sep + 'package.json', 'not_exiting');
      mock(process.cwd() + path.sep + 'package.json', 'not_existing');
      mock('../../../package.json', mockedPackageJson);
      const utils = mock.reRequire('../lib/utils');

      assert.deepEqual(utils.loadPackageJson(), mockedPackageJson)
    });

    it('should return null if all attempts fail', () => {
      mock(appRootPath + path.sep + 'package.json', 'not_exiting');
      mock(process.cwd() + path.sep + 'package.json', 'not_existing');
      mock('../../../package.json', 'not_existing');
      const utils = mock.reRequire('../lib/utils');

      assert.isNull(utils.loadPackageJson())
    });
  })
});
