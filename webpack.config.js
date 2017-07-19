const path = require('path');
const fs = require('fs');
const shell = require('shelljs');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const InstallRDFPlugin = require('./webpack/install-rdf-plugin');
const PreferencesPlugin = require('./webpack/preferences-plugin');
const TranslatorHeaderPlugin = require('./webpack/translator-header-plugin');
const CommonsPlugin = new webpack.optimize.CommonsChunkPlugin({ name: 'common', filename: 'common.js' })
const UglifyEsPlugin = require('uglify-es-webpack-plugin');

const version = require('./webpack/version');
const translators = require('./webpack/translators');

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

console.log("let's roll");
module.exports = [
  // main app logic
  {
    plugins: [
      CommonsPlugin,
      /* tree shaking
      new UglifyEsPlugin({
        compress: false,
        mangle: false,
        output: {
          beautify: true,
        },
      })
      */
    ],
    context: path.resolve(__dirname, './content'),
    entry: {
      "better-bibtex": './better-bibtex.coffee'
    },
    output: {
      path: path.resolve(__dirname, './build/content'),
      filename: '[name].js',
      jsonpFunction: 'BetterBibTeXLoader',
    },
    module: {
      rules: [
        { test: /\.coffee$/, use: [ 'coffee-loader' ] },
      ]
    },
  },

  // static files
  {
    entry: './package.json',
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'install.rdf'
    },
    plugins: [
      new InstallRDFPlugin(),
      new PreferencesPlugin(),
      new CopyWebpackPlugin(
        [
          { from: 'content/**/*' },
          { from: 'chrome.manifest' },
        ],
        { ignore: [ '*.coffee' ], copyUnmodified: true }
      )
    ]
  },

  // translators
  {
    resolveLoader: {
      alias: {
        'pegjs-loader': path.join(__dirname, './webpack/pegjs-loader'),
      },
    },
    plugins: [ new TranslatorHeaderPlugin() ],
    context: path.resolve(__dirname, './resource'),
    entry: translators().reduce((entries, f) => {
      var translator = f.replace(/\.json$/, '');
      entries[translator] = `./${translator}.coffee`;
      return entries
    }, {}),
    output: {
      path: path.resolve(__dirname, './build/resource'),
      filename: '[name].js',
      jsonpFunction: 'webpackedBetterBibTeXTranslator',
    },
    module: {
      rules: [
        { test: /\.coffee$/, use: [ 'coffee-loader' ] },
        { test: /\.pegjs$/, use: [ 'pegjs-loader' ] },
      ]
    }
  },
];
