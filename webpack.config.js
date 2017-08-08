const path = require('path');
const fs = require('fs');
const shell = require('shelljs');

const webpack = require('webpack');
const TranslatorHeaderPlugin = require('./webpack/translator-header-plugin');
// const CommonsPlugin = new webpack.optimize.CommonsChunkPlugin({ name: 'common', filename: 'common.js' })

const version = require('./webpack/version');
const translators = require('./webpack/translators');
const dateparser = require('./webpack/dateparser');
const rdf = require('./webpack/rdf');
const preferences = require('./webpack/preferences');
const assets = require('./webpack/copy-assets');
const _ = require('lodash')

console.log('make build dirs');
if (!fs.existsSync(path.join(__dirname, 'build'))) {
  fs.mkdirSync(path.join(__dirname, 'build'));
}
if (!fs.existsSync(path.join(__dirname, 'gen'))) {
  fs.mkdirSync(path.join(__dirname, 'gen'));
}

console.log('generate translator list');
var tr = {byId: {}, byName: {}, byLabel: {}};
translators().forEach(header => {
  var header = require(path.join(__dirname, 'resource', header + '.json'));
  tr.byId[header.translatorID] = header;
  tr.byName[header.label] = header;
  tr.byLabel[header.label.replace(/[^a-zA-Z]/g, '')] = header;
});
fs.writeFileSync(path.join(__dirname, 'gen/translators.json'), JSON.stringify(tr, null, 2));

console.log('update citeproc');
if (shell.exec('git submodule update --depth 1 -- citeproc-js').code != 0) throw 'Citeproc update failed';

dateparser(path.join(__dirname, 'citeproc-js/locale'), path.join(__dirname, 'gen/dateparser-data.json'));
rdf();
preferences();
assets();

console.log("let's roll");

var common = {
  node: {
    fs: 'empty'
  },
  resolveLoader: {
    alias: {
      'pegjs-loader': path.join(__dirname, './webpack/pegjs-loader'),
      'json-loader': path.join(__dirname, './webpack/json-loader'),
    },
  },
  module: {
    rules: [
      { test: /\.coffee$/, use: [ {loader: 'coffee-loader', options: { sourceMap: false } } ] },
      { test: /\.pegjs$/, use: [ 'pegjs-loader' ] },
      { test: /\.json$/, use: [ 'json-loader' ] },
    ]
  },
}

module.exports = [
  // main app logic
  _.merge({}, common, {
    plugins: [
      // new webpack.DefinePlugin({ global: {} })
    ],
    context: path.resolve(__dirname, './content'),
    entry: {
      "better-bibtex": './better-bibtex.coffee',
      // "preferences/preferences": './preferences/preferences.coffee',
    },
    // devtool: '#source-map',
    output: {
      path: path.resolve(__dirname, './build/content'),
      filename: '[name].js',
      jsonpFunction: 'WebPackedBetterBibTeX',
      devtoolLineToLine: true,
      // sourceMapFilename: "./[name].js.map",
      pathinfo: true,
    },
  }),

  // translators
  _.merge({}, common, {
    plugins: [
      new TranslatorHeaderPlugin()
    ],
    context: path.resolve(__dirname, './resource'),
    entry: translators().reduce((entries, f) => {
      var translator = f.replace(/\.json$/, '');
      entries[translator] = `./${translator}.coffee`;
      return entries
    }, {}),
    // devtool: '#source-map',
    output: {
      path: path.resolve(__dirname, './build/resource'),
      filename: '[name].js',
      devtoolLineToLine: true,
      // sourceMapFilename: "./[name].js.map",
      pathinfo: true,
    },
  }),

  // minitests
  _.merge({}, common, {
    context: path.resolve(__dirname, './minitests'),
    entry: {
      'pfunc': './pfunc.coffee',
      'dateparser': './dateparser.coffee',
      'text2latex': './text2latex.coffee',
    },
    output: {
      path: path.resolve(__dirname, './minitests/build'),
      filename: '[name].js',
      devtoolLineToLine: true,
      pathinfo: true,
    },
  }),
];
