#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const rif = require('replace-in-file');
const exec = require('child_process').exec;

const currentDirectory = process.cwd();

inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Enter the name of your project:'
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
    choices: [ 'Jest', 'Jasmine', 'Mocha', 'None' ],
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
  fs.mkdirSync(projectDir);

  // Getting the templates
  const templateRoot = `${__dirname}/templates`
  const templateDir = `${templateRoot}/${answers.tsEnabled ? 'ts' : 'js'}`;
  recurCpTemplates(templateDir, answers.name);
  recurCpTemplates(`${templateRoot}/common`, answers.name);

  // Dev dependencies
  const devDep = [ 'webpack', 'webpack-cli', 'codecov', 'eslint' ];

  if (answers.tsEnabled) {
    devDep.push('typescript', 'ts-loader');
    moveFile(`${templateRoot}/other/tsconfig.json`, `${projectDir}/tsconfig.json`);
  }

  // Define the test command and the associated dependencies
  let testCmd;
  if (answers.testFwk === 'jest') {
    testCmd = 'jest';
    devDep.push('jest', '@babel/plugin-transform-modules-commonjs');
    if (answers.tsEnabled) {
      devDep.push('ts-jest', '@types/jest');
      moveFile(`${templateRoot}/other/jest.config.js`, `${projectDir}/jest.config.js`);
    }
  } else if (answers.testFwk === 'mocha') {
    testCmd = `mocha --recursive './tests/**.test.js'`;
    devDep.push('mocha', 'chai');
    if (answers.tsEnabled) {
      devDep.push('@types/mocha', '@types/chai')
    }
  } else if (answers.testFwk === 'jasmine') {
    testCmd = 'jasmine'
    devDep.push('jasmine');
  } else {
    testCmd = 'echo \"Error: no test specified\" && exit 1';
  }

  console.log('Installing NPM dependencies');
  const install = exec(`npm install -D --prefix ${projectDir} ${devDep.join(' ')}`);

  install.stdout.on('data', data => {
    console.log(data);
  });

  install.stderr.on('data', err => {
    console.error(err);
  });

  install.on('close', () => {
    console.log('Dependencies installed.');
  });

  // Webpack config
  
  let webpackTemplateFile;

  if (answers.tsEnabled) {
    if (answers.isLibrary) {
      webpackTemplateFile = 'webpack.ts.umd';
    } else {
      webpackTemplateFile = 'webpack.ts.nolib';
    }
  } else if (answers.isLibrary) {
    webpackTemplateFile = 'webpack.js.umd';
  }

  if(webpackTemplateFile) {
    moveFile(`${templateRoot}/other/${webpackTemplateFile}`, `${projectDir}/webpack.config.js`);
    rif.sync({
      files: `${projectDir}/webpack.config.js`,
      from: /project-name-replace/g,
      to: answers.name
    });
  }

  // Replacing user values

  const buildCmd = webpackTemplateFile ? 'webpack --config webpack.config.js' : 'echo \"Error: no build specified\" && exit 1'
  const mainFile = answers.tsEnabled ? 'index.ts' : 'index.js';

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
      testCmd,
      buildCmd,
      mainFile
    ]
  });
  
  // Create travis file
  if (answers.travisEnabled) {
    moveFile(`${templateRoot}/other/.travis.yml`, `${projectDir}/travis.yml`);
  }

  // Create babel file for transpiling (tests)
  if (answers.isLibrary) {
    moveFile(`${templateRoot}/other/.babelrc`, `${projectDir}/.babelrc`);
  }
}

/**
 * Recursive copy of a folder
 * @param templateDir 
 * @param newProjectPath 
 */
function recurCpTemplates (templateDir, newProjectPath) {
  const filesToCreate = fs.readdirSync(templateDir);

  filesToCreate.forEach(file => {
    const origFilePath = `${templateDir}/${file}`;
    
    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      const writePath = `${currentDirectory}/${newProjectPath}/${file}`;
      moveFile(origFilePath, writePath)
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${currentDirectory}/${newProjectPath}/${file}`);
      
      // recursive call
      recurCpTemplates(`${templateDir}/${file}`, `${newProjectPath}/${file}`);
    }
  });
}

/**
 * Copy a file
 * @param src 
 * @param target 
 */
function moveFile(src, target) {
  const contents = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(target, contents, 'utf8');
}