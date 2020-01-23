const helpers = require('../src/helpers');

test('Should return jest JS Library config', () => {
    const expectedDependecies = ['webpack', 'webpack-cli', 'codecov', 'jest', 'babel-loader', '@babel/core', '@babel/preset-env', '@babel/plugin-transform-modules-commonjs'].sort();
    const options = helpers.setOptions({
        tsEnabled: false,
        isLibrary: true,
        testFwk: 'jest'
    });
    options.devDependencies.sort();
    expect(expectedDependecies.join(' ')).toBe(options.devDependencies.join(' '));
});

test('Should return jest TS Library config', () => {
    const expectedDependecies = ['webpack', 'webpack-cli', 'codecov', 'typescript', 'ts-loader', 'jest', '@babel/plugin-transform-modules-commonjs', 'ts-jest', '@types/jest'].sort();
    const options = helpers.setOptions({
        tsEnabled: true,
        isLibrary: true,
        testFwk: 'jest'
    });
    options.devDependencies.sort();
    expect(expectedDependecies.join(' ')).toBe(options.devDependencies.join(' '));
});

test('Should return jest JS config', () => {
    const expectedDependecies = ['webpack', 'webpack-cli', 'codecov', 'jest', 'babel-loader', '@babel/core', '@babel/preset-env'].sort();
    const options = helpers.setOptions({
        tsEnabled: false,
        isLibrary: false,
        testFwk: 'jest'
    });
    options.devDependencies.sort();
    expect(expectedDependecies.join(' ')).toBe(options.devDependencies.join(' '));
});

test('Should return jest TS config', () => {
    const expectedDependecies = ['webpack', 'webpack-cli', 'codecov', 'typescript', 'ts-loader', 'jest', 'ts-jest', '@types/jest'].sort();
    const options = helpers.setOptions({
        tsEnabled: true,
        isLibrary: false,
        testFwk: 'jest'
    });
    options.devDependencies.sort();
    expect(expectedDependecies.join(' ')).toBe(options.devDependencies.join(' '));
});


test('Should return mocha JS Library config', () => {
    const expectedDependecies = ['webpack', 'webpack-cli', 'codecov', 'mocha', 'chai', 'babel-loader', '@babel/core', '@babel/preset-env'].sort();
    const options = helpers.setOptions({
        tsEnabled: false,
        isLibrary: true,
        testFwk: 'mocha'
    });
    options.devDependencies.sort();
    expect(expectedDependecies.join(' ')).toBe(options.devDependencies.join(' '));
});

test('Should return mocha TS Library config', () => {
    const expectedDependecies = ['webpack', 'webpack-cli', 'codecov', 'typescript', 'ts-loader', 'mocha', 'chai', 'ts-node', '@types/mocha', '@types/chai'].sort();
    const options = helpers.setOptions({
        tsEnabled: true,
        isLibrary: true,
        testFwk: 'mocha'
    });
    options.devDependencies.sort();
    expect(expectedDependecies.join(' ')).toBe(options.devDependencies.join(' '));
});

test('Should return mocha JS config', () => {
    const expectedDependecies = ['webpack', 'webpack-cli', 'codecov', 'mocha', 'chai', 'babel-loader', '@babel/core', '@babel/preset-env'].sort();
    const options = helpers.setOptions({
        tsEnabled: false,
        isLibrary: false,
        testFwk: 'mocha'
    });
    options.devDependencies.sort();
    expect(expectedDependecies.join(' ')).toBe(options.devDependencies.join(' '));
});

test('Should return mocha TS config', () => {
    const expectedDependecies = ['webpack', 'webpack-cli', 'codecov', 'typescript', 'ts-loader', 'mocha', 'chai', 'ts-node', '@types/mocha', '@types/chai'].sort();
    const options = helpers.setOptions({
        tsEnabled: true,
        isLibrary: false,
        testFwk: 'mocha'
    });
    options.devDependencies.sort();
    expect(expectedDependecies.join(' ')).toBe(options.devDependencies.join(' '));
});
