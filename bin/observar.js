#!/usr/bin/env node
'use strict';

const exec = require('child_process').exec;
const chokidar = require('chokidar');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const arg = require('arg');
const logSymbols = require('log-symbols');
const pkg = require('../package');

const warn = message => `${logSymbols.warning} ${chalk.yellow.bold(message)}`;
const info = message => `${logSymbols.info} ${message}`;
const err = message => `${logSymbols.error} ${message}`;

const primaryColor = chalk.rgb(255, 179, 71);

const startObservar = config => {
  const watcher = chokidar.watch(config.watchPattern, {
    ignored: config.ignorePattern,
    persistent: true,
    awaitWriteFinish: true,
    ignoreInitial: true,
    atomic: true,
  });

  let message = `${primaryColor.bold('Observing:')} ${chalk.bold(config.watchPattern)}\n${primaryColor(
    'Command:',
  )} ${chalk.bold(config.script)}`;

  if (config.experimental) {
    message += '\n' + warn('Experimental Features enabled');
  }

  console.log(
    boxen(message, {
      borderColor: 'white',
      padding: 1,
      margin: 1,
    }),
  );

  watcher
    .on('add', path => notifyAndExecute(path, 'added', config))
    .on('change', path => notifyAndExecute(path, 'changed', config))
    .on('unlink', path => notifyAndExecute(path, 'removed', config))
    .on('error', error => console.log(err(`Error while watching files: ${error}`)));
};

const notifyAndExecute = (path, type, config) => {
  let execSpinner = {};
  const cmd = config.script;

  console.log(info(`File ${chalk.whiteBright.underline(path)} was ${type}!`));

  if (config.experimental) {
    execSpinner = ora(`Executing ${primaryColor(cmd)}...`, {
      spinner: 'arc',
      discardStdin: false,
    }).start();
  } else {
    console.log(`⚙ Executing ${primaryColor(cmd)}...`);
  }

  exec(`npm run ${cmd}`, (error, stdout, stderr) => {
    if (error || stderr) {
      const message = `Error while executing: ${error || stderr}`;

      config.experimental ? (execSpinner = execSpinner.fail(message)) : console.log(err(message));
      return;
    }

    if (stdout) {
      const message = `Successfully executed ${primaryColor(cmd)}\n`;

      config.experimental
        ? (execSpinner = execSpinner.succeed(message))
        : console.log(`${logSymbols.success} ${message}`);
    }
  });
};

const getConfig = args => {
  let config = {};

  config.script = args['--script'];

  if (args._.length > 0) {
    config.watchPattern = args._;
  } else {
    config.watchPattern = '.';
  }

  if (args['--experimental']) {
    config.experimental = true;
  }

  if (args['--ignore']) {
    config.ignorePattern = args['--ignore'];
  }

  return config;
};

const getHelp = () => chalk`
  {bold.rgb(255,179,71) observar} - Watch your files and act!
  {bold USAGE}
      {bold $} {rgb(255,179,71) observar} --help
      {bold $} {rgb(255,179,71) observar} --version
      {bold $} {rgb(255,179,71) observar} [{underline folder, path or glob pattern}] -s [{underline script}]
      By default, {rgb(255,179,71) observar} will watch the current working directory.
  {bold OPTIONS}
      -h, --help                          Shows this help message
      -v, --version                       Displays the current version of observar
      -s, --script                        Specify a npm command that should be executed on file changes.
      -i, --ignore                        Specify a glob pattern or path for files which should be ignored.
      -e, --experimental                  Enables experimental features.
`;

(async () => {
  let args = null;

  try {
    args = arg({
      '--help': Boolean,
      '--version': Boolean,
      '--experimental': Boolean,
      '--script': String,
      '--ignore': String,
      '-h': '--help',
      '-v': '--version',
      '-s': '--script',
      '-i': '--ignore',
      '-e': '--experimental',
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  if (args['--version']) {
    console.log(pkg.version);
    return;
  }

  if (args['--help']) {
    console.log(getHelp());
    return;
  }

  if (!args['--script']) {
    console.error(err('Please provide a script argument.'));
    return;
  }

  const config = getConfig(args);
  startObservar(config);
})();
