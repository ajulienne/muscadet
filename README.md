# Muscadet

[![Build Status](https://travis-ci.com/ajulienne/muscadet.svg?branch=master)](https://travis-ci.com/ajulienne/muscadet)

CLI tool used to generate a bare JS or TS project.

Can build either a javascript of a typescript project, and can bundle it as a library. Support standard config of some testing frameworks.

## Installation

```bash
npm install -g muscadet
```

## Usage

Open a terminal where you want to generate a new project and execute the following command :

```
muscadet
```

The CLI will ask a series of questions, such as :

* The project name
* A short description of your project
* The author name
* If you want typescript enabled or not
* The desired testing framework (support `jest` and `mocha` for now, you can specify `none` if you don't want any or if you want to manually install another one)
* If you want to bundle your project as a library (UMD support with webpack)
* If you want a travis config file