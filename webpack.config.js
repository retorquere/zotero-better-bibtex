const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const replace = require('replace');

const webpack = require('webpack');

const CircularDependencyPlugin = require('circular-dependency-plugin')

const AfterBuildPlugin = require('./webpack/plugins/after-build')
const TranslatorHeaderPlugin = require('./webpack/plugins/translator-header');
// const WrapperPlugin = require('wrapper-webpack-plugin');

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
for (let label of Object.keys(translators)) {
  var header = require(path.join(__dirname, 'resource', label + '.json'));
  tr.byId[header.translatorID] = header;
  tr.byName[header.label] = header;
  tr.byLabel[header.label.replace(/[^a-zA-Z]/g, '')] = header;
}
fs.writeFileSync(path.join(__dirname, 'gen/translators.json'), JSON.stringify(tr, null, 2));

if (shell.exec(`git submodule update --init --recursive`).code != 0) throw 'submodule update failed';

dateparser(path.join(__dirname, 'citeproc-js/locale'), path.join(__dirname, 'gen/dateparser-data.json'));
rdf();
preferences();
assets();
console.log('write version'); fs.writeFileSync(path.join(__dirname, 'gen/version.js'), `module.exports = ${JSON.stringify(version)};\n`, 'utf8')

require('./webpack/translator-typing.js')

console.log("let's roll");

var common = {
  node: {
    fs: 'empty'
  },
  resolveLoader: {
    alias: {
      'pegjs-loader': path.join(__dirname, './webpack/loaders/pegjs'),
      'json-loader': path.join(__dirname, './webpack/loaders/json'),
      'wrap-loader': path.join(__dirname, './webpack/loaders/wrap'),
      'bcf-loader': path.join(__dirname, './webpack/loaders/bcf'),
    },
  },
  module: {
    rules: [
      { test: /\.coffee$/, use: [ {loader: 'coffee-loader', options: { sourceMap: false } }, 'wrap-loader' ] },
      { test: /\.pegjs$/, use: [ 'pegjs-loader' ] },
      { test: /\.json$/, use: [ 'json-loader' ] },
      { test: /\.bcf$/, use: [ 'bcf-loader' ] },
      // { enforce: 'pre', test: /\.ts$/, exclude: /node_modules/, loader: 'tslint-loader?' + JSON.stringify({ emitErrors: true, failOnHint: true }) },
      { test: /\.ts$/, exclude: [ /node_modules/ ], use: [ 'wrap-loader', 'ts-loader' ] }
    ]
  },
}

function BailPlugin() {
  this.plugin('done', function(stats) {
    while (stats.compilation.warnings.length) {
      stats.compilation.errors.push(stats.compilation.warnings.pop())
    }
  });
};

config = [];

config.push(
  // main app logic
  _.merge({}, common, {
    plugins: [
      new webpack.NamedModulesPlugin(),
      new CircularDependencyPlugin({ failOnError: true }),
      new webpack.optimize.CommonsChunkPlugin({ minChunks: 2, name: 'common', filename: 'common.js' }),
      new AfterBuildPlugin(function(stats, options) {
        var ccp = options.plugins.find(function(plugin) { return plugin instanceof webpack.optimize.CommonsChunkPlugin }).filenameTemplate;
        replace({
          regex: `window\\["${options.output.jsonpFunction}"\\]`,
          replacement: options.output.jsonpFunction,
          paths: [path.join(options.output.path, ccp)],
        });
      }),
			BailPlugin,
    ],

    context: path.resolve(__dirname, './content'),
    entry: {
      BetterBibTeX: './BetterBibTeX.ts',
      'BetterBibTeX.KeyManager': './keymanager.ts',
      'BetterBibTeX.TestSupport': './test/support.ts',
      'BetterBibTeX.Preferences': './Preferences.ts',
      'BetterBibTeX.ErrorReport': './ErrorReport.ts',
      'BetterBibTeX.itemPane': './itemPane.ts',
      'BetterBibTeX.exportOptions': './exportOptions.ts',
    },
    // devtool: '#source-map',
    output: {
      path: path.resolve(__dirname, './build/content'),
      filename: '[name].js',
      jsonpFunction: 'Zotero.WebPackedBetterBibTeX',
      // chunkFilename: "[id].chunk.js",
      devtoolLineToLine: true,
      // sourceMapFilename: "./[name].js.map",
      pathinfo: true,
      library: "Zotero.[name]",
      libraryTarget: "assign",
    },
  })
);

for (let [label, source] of Object.entries(translators)) {
  config.push(
    _.merge({}, common, {
      plugins: [
        new CircularDependencyPlugin({ failOnError: true }),
        new TranslatorHeaderPlugin(label),
				BailPlugin,
      ],
      context: path.resolve(__dirname, './resource'),
      entry: { [label]: `./${source}` },

      output: {
        path: path.resolve(__dirname, './build/resource'),
        filename: '[name].js',
        devtoolLineToLine: true,
        // sourceMapFilename: "./[name].js.map",
        pathinfo: true,
      },
    }),
  )
}

module.exports = config;
