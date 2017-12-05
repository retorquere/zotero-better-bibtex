import * as pegjs from 'pegjs'

export = function loader(source) {
  // Description of PEG.js options: https://github.com/pegjs/pegjs#javascript-api
  return pegjs.generate(source, {
    output: 'source',
    cache: false,
    optimize: 'speed',
    trace: false,
    format: 'commonjs',
  })
}
