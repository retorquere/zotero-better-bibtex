'use strict';

var pegjs = require('pegjs');

function loader(source) {
  // Description of PEG.js options: https://github.com/pegjs/pegjs#javascript-api
  var pegOptions = {
    output: 'source',
    cache: false,
    optimize: 'speed',
    trace: false,
    format: 'commonjs',
    // dependencies: { Mapping: './latex_unicode_mapping.coffee', Support: './bibtex-parser-support.coffee' }
  };
  /*
  if (allowedStartRules.length > 0) {
    pegOptions.allowedStartRules = allowedStartRules;
  }
  */

  return pegjs.generate(source, pegOptions);
}

module.exports = loader
