"use strict";
const path = require('path');
const shell = require('shelljs');
const project = path.join(__dirname, '..', '..')
const tsc = path.join(project, 'node_modules', '.bin', 'tsc')

if (shell.exec(`${tsc} --lib es6 webpack/tslint/*.ts`).code != 0) throw 'tslint rule compilation failed';

const tslint = require("tslint");
const tslint_json = path.join(project, 'tslint.json')
const options = {
    fix: false,
    formatter: "stylish",
    rulesDirectory: path.join(project, 'webpack', 'tslint'),
};

module.exports = function (source) {
  // this.cacheable()

  var linter = new tslint.Linter(options);
  var configuration = tslint.Configuration.findConfiguration(tslint_json, this.resourcePath).results;
	linter.lint(this.resourcePath, source, configuration);
	var result = linter.getResult();
	console.log(result);

	return source;
}
