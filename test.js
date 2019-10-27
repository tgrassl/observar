/* eslint-env mocha */

'use strict';
const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const chai = require('chai');
const { expect } = chai;
const rewire = require('rewire');
const sinon = require('sinon');
const pkg = require('./package.json');

chai.use(require('sinon-chai'));
chai.should();

const write = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const binFile = pkg.bin.observar;
const observar = rewire(binFile);

const run = (...args) => {
  let cmd = 'node ' + binFile;
  args.forEach(arg => (cmd += ` ${arg}`));
  return exec(cmd);
};

const delay = async time => {
  return new Promise(resolve => {
    const timer = time || 20;
    setTimeout(resolve, timer);
  });
};

const startObservar = observar.__get__('startObservar');
const stopObservar = () => observar.__get__('watcher').close();

describe('observar cli', () => {
  let executeSpy;
  beforeEach(() => {
    const mockExec = sinon.spy(function readySpy() {});
    observar.__set__('exec', mockExec);
    observar.__set__('console.log', () => {});

    const notifyAndExecute = observar.__get__('notifyAndExecute');
    executeSpy = sinon.spy(notifyAndExecute);
    observar.__set__('notifyAndExecute', executeSpy);
  });

  it('observar -v should be ok', async () => {
    const res = await run('-v');
    expect(res.stdout).to.contain(pkg.version);
  });

  it('observar -h should be ok', async () => {
    const res = await run('-h');
    expect(res.stdout).to.contain('USAGE');
  });

  it('should throw error if no script is set', async () => {
    const res = await run('');
    expect(res.stderr).not.to.be.empty;
    expect(res.stderr).to.contain('Please provide a script argument.');
  });

  it('should get config mapped to args', async () => {
    const getConfig = observar.__get__('getConfig');
    const expectedConfig = {
      script: 'myScript',
      watchPattern: '.',
    };

    const args = { _: [], '--script': 'myScript' };
    expect(getConfig(args)).to.contain(expectedConfig);
  });

  it('should get config mapped to args', () => {
    const getConfig = observar.__get__('getConfig');
    const expectedConfig = {
      script: 'myScript',
      watchPattern: './src',
      ignorePattern: 'dist/',
    };

    const args = { _: './src', '--script': 'myScript', '--ignore': 'dist/' };
    expect(getConfig(args)).to.contain(expectedConfig);
  });

  it('should use current working dir if no path is set', () => {
    const getConfig = observar.__get__('getConfig');
    const expectedConfig = {
      script: 'myScript',
      watchPattern: '.',
    };

    const args = { _: [], '--script': 'myScript' };
    expect(getConfig(args)).to.contain(expectedConfig);
  });

  it('should call notifyAndExecute on file added', async () => {
    const testPath = 'test.txt';
    const config = {
      script: 'myScript',
      watchPattern: '.',
    };
    startObservar(config);
    await delay();
    await write(testPath, Date.now());
    await delay(50);

    expect(executeSpy).to.have.been.called;
    expect(executeSpy).to.have.been.calledWith(testPath, 'added');
    stopObservar();
    await unlink(testPath);
  });

  it('should call notifyAndExecute on file changed', async () => {
    const testPath = 'test.txt';
    const config = {
      script: 'myScript',
      watchPattern: '.',
    };
    await write(testPath, Date.now());
    await delay();
    startObservar(config);
    await delay();
    await write(testPath, Date.now());
    await delay();

    expect(executeSpy).to.have.been.called;
    expect(executeSpy).to.have.been.calledWith(testPath, 'changed');
    stopObservar();
    await unlink(testPath);
  });

  it('should call notifyAndExecute on file removed', async () => {
    const testPath = 'test.txt';
    const config = {
      script: 'myScript',
      watchPattern: '.',
    };
    await write(testPath, Date.now());
    await delay();
    startObservar(config);
    await delay();
    await unlink(testPath);
    await delay(150);

    expect(executeSpy).to.have.been.called;
    expect(executeSpy).to.have.been.calledWith(testPath, 'removed');
    stopObservar();
  });
});
