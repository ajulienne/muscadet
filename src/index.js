#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const rif = require('replace-in-file');
const chalk = require('chalk');

const helpers = require('./helpers');

const currentDirectory = process.cwd();

inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Enter the name of your project:',
    validate: function(val) {
      const npmPackageNameRegex = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
      if (!val || !npmPackageNameRegex.test(val)) {
        return 'The name does not respect the NPM package name rule.';
      } else {
        return true;
      }
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'Enter a short description of your project:'
  },
  {
    type: 'input',
    name: 'author',
    message: 'Enter your name:'
  },
  {
    type: 'confirm',
    name: 'tsEnabled',
    default: true,
    message: 'Do you want to enable Typescript?'
  },
  {
    type: 'list',
    name: 'testFwk',
    message: 'What testing framework do you want?',
    choices: [ 'Jest', 'Mocha', 'None' ],
    filter: function(val) { return val.toLowerCase(); }
  },
  {
    type: 'confirm',
    name: 'travisEnabled',
    default: true,
    message: 'Do you want to enable Travis CI?'
  },
  {
    type: 'confirm',
    name: 'isLibrary',
    message: 'Is your project a library?',
    default: true
  }
]).then(answers => {
  generate(answers);
});

/**
 * Generate a project using the prompt answers
 * @param {*} answers result of the prompt
 */
function generate(answers) {
  const projectDir = `${currentDirectory}/${answers.name}`;
  
  // Creating the project dir
  console.log(`\nGenerating project in ${chalk.blue(projectDir)}\n`);
  fs.mkdirSync(projectDir);

  // Getting the templates
  const templateRoot = `${__dirname}/../templates`
  const templateDir = `${templateRoot}/${answers.tsEnabled ? 'ts' : 'js'}`;
  helpers.recurCpTemplates(currentDirectory, templateDir, answers.name);
  helpers.recurCpTemplates(currentDirectory, `${templateRoot}/common`, answers.name);

  const config = helpers.setOptions(answers);

  // Webpack config

  console.log('\t* Copying files...');
  const webpackTemplateFile = `webpack.${answers.tsEnabled ? 'ts' : 'js'}.${answers.isLibrary ? 'umd' : 'nolib'}`;
  helpers.moveFile(`${templateRoot}/other/${webpackTemplateFile}`, `${projectDir}/webpack.config.js`);

  // Create tsconfig file
  if (answers.tsEnabled) {
    helpers.moveFile(`${templateRoot}/other/tsconfig.json`, `${projectDir}/tsconfig.json`);
  }
  
  // Create travis file
  if (answers.travisEnabled) {
    helpers.moveFile(`${templateRoot}/other/.travis.yml`, `${projectDir}/travis.yml`);
  }

  // Config files for jest
  if (answers.testFwk === 'jest') {
    if (answers.tsEnabled) {
      helpers.moveFile(`${templateRoot}/other/jest.config.js`, `${projectDir}/jest.config.js`);
    }
    if (answers.isLibrary) {
      helpers.moveFile(`${templateRoot}/other/.babelrc`, `${projectDir}/.babelrc`);
    }
  }

  // Replacing user values

  console.log('\t* Replacing user values...');
  const buildCmd = webpackTemplateFile ? 'webpack --config webpack.config.js' : 'echo \"Error: no build specified\" && exit 1'
  const mainFile = answers.tsEnabled ? 'index.ts' : 'index.js';

  // Webpack config
  rif.sync({
    files: `${projectDir}/webpack.config.js`,
    from: /project-name-replace/g,
    to: answers.name
  });

  // Package.json
  rif.sync({
    files: `${projectDir}/package.json`,
    from: [
      /project-name-replace/g,
      /project-desc-replace/g,
      /author-replace/g,
      /test-command-replace/g,
      /build-command-replace/g,
      /main-file-replace/g
    ],
    to: [
      answers.name,
      answers.description,
      answers.author,
      config.testCmd,
      buildCmd,
      mainFile
    ]
  });

  console.log('\t* Installing dependencies...');
  helpers.installDependencies(config.devDependencies, projectDir)
  .then(() => {
    console.log('\t  Dependencies installed');
    helpers.quickstart(answers.name);
  });
}
