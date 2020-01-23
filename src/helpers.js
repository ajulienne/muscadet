const fs = require('fs');
const exec = require('child_process').exec;
const chalk = require('chalk');

module.exports = {
    /**
     * Given the prompt's answers, define the dev dependencies and the test command of the generated project
     * @param {*} answers User prompt's answers
     * @param {*} templateRoot Directory of the templates
     * @param {*} projectDir Directory of the generated project
     */
    setOptions(answers) {
        // Dev dependencies
        const devDependencies = ['webpack', 'webpack-cli', 'codecov'];

        if (answers.tsEnabled) {
            devDependencies.push('typescript', 'ts-loader');
        } else {
            devDependencies.push('babel-loader', '@babel/core', '@babel/preset-env');
        }

        // Define the test command and the associated dependencies
        let testCmd;
        if (answers.testFwk === 'jest') {
            testCmd = 'jest';
            devDependencies.push('jest');
            // Create babel file for transpiling (tests)
            if (answers.isLibrary) {
                devDependencies.push('@babel/plugin-transform-modules-commonjs');
            }
            if (answers.tsEnabled) {
                devDependencies.push('ts-jest', '@types/jest');
            }
        } else if (answers.testFwk === 'mocha') {
            testCmd = 'mocha';
            devDependencies.push('mocha', 'chai');
            if (answers.tsEnabled) {
                testCmd = 'mocha -r ts-node/register test/**/*.spec.ts';
                devDependencies.push('@types/mocha', '@types/chai', 'ts-node')
            }
        } else {
            testCmd = 'echo \"Error: no test specified\" && exit 1';
        }

        return {
            devDependencies,
            testCmd
        }
    },

    /**
     * Copy a file
     * @param src Source
     * @param target Target
     */
    moveFile(src, target) {
        const contents = fs.readFileSync(src, 'utf8');
        fs.writeFileSync(target, contents, 'utf8');
    },

    /**
     * Recursive copy of a folder
     * @param currentDirectory Directory where the cli is called
     * @param templateDir Directory of the templates
     * @param newProjectPath Directory of the generated project
     */
    recurCpTemplates(currentDirectory, templateDir, newProjectPath) {
        const filesToCreate = fs.readdirSync(templateDir);

        filesToCreate.forEach(file => {
            const origFilePath = `${templateDir}/${file}`;

            // get stats about the current file
            const stats = fs.statSync(origFilePath);

            if (stats.isFile()) {
                const writePath = `${currentDirectory}/${newProjectPath}/${file}`;
                this.moveFile(origFilePath, writePath)
            } else if (stats.isDirectory()) {
                fs.mkdirSync(`${currentDirectory}/${newProjectPath}/${file}`);

                // recursive call
                this.recurCpTemplates(currentDirectory, `${templateDir}/${file}`, `${newProjectPath}/${file}`);
            }
        });
    },

    /**
     * Execute `npm install --save-dev` in the target directory and print stdio
     * @param {*} devDependencies Array of dev dependencies
     * @param {*} targetDir Target directory to install the _node_modules_
     */
    installDependencies(devDependencies, targetDir) {
        return new Promise((resolve, reject) => {
            const install = exec(`npm install -D --prefix ${targetDir} ${devDependencies.join(' ')}`);

            install.on('close', (returnCode) => {
                if (returnCode !== 0) {
                    console.log(chalk.red('Installation failed'));
                    reject();
                    return;
                }
                resolve();
            });
        });
    },

    quickstart(projectName) {
        console.log(chalk.green('\nProject successfully generated!'));
        console.log(`\nQuickstart :\n\tcd ${chalk.blue(projectName)}\n\tnpm run build\n`);
    }
};