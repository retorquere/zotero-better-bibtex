const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const replace = require('replace');

const webpack = require('webpack');

const CircularDependencyPlugin = require('circular-dependency-plugin')

const AfterBuildPlugin = require('./webpack/plugins/after-build')
const TranslatorHeaderPlugin = require('./webpack/plugins/translator-header');
const WrapperPlugin = require('wrapper-webpack-plugin');

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
translators.forEach(header => {
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
console.log('write version'); fs.writeFileSync(path.join(__dirname, 'gen/version.js'), `module.exports = ${JSON.stringify(version)};\n`, 'utf8')

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
    },
  },
  module: {
    rules: [
      { test: /\.coffee$/, use: [ {loader: 'coffee-loader', options: { sourceMap: false } }, 'wrap-loader' ] },
      { test: /\.pegjs$/, use: [ 'pegjs-loader' ] },
      { test: /\.json$/, use: [ 'json-loader' ] },
      { enforce: 'pre', test: /\.ts$/, exclude: /node_modules/, loader: 'tslint-loader?' + JSON.stringify({ emitErrors: true, failOnHint: true }) },
      { test: /\.ts$/, exclude: [ /node_modules/ ], use: 'ts-loader' }
    ]
  },
}

config = [
  // main app logic
  _.merge({}, common, {
    plugins: [
      // new webpack.DefinePlugin({ global: {} })
      new webpack.NamedModulesPlugin(),
      new CircularDependencyPlugin({ failOnError: true }),
      new webpack.optimize.CommonsChunkPlugin({ minChunks: 2, name: 'common', filename: 'common.js' }),
      /*
      new WrapperPlugin({
        test: /\.js$/, // only wrap output of bundle files with '.js' extension 
        // header: function(filename) { return `Zotero.debug('BBT: loading ${filename}');\n` },
        footer: function(filename) { return `Zotero.debug('BBT: after load ${filename}');\n` },
      }),
      */
      new AfterBuildPlugin(function(stats, options) {
        var ccp = options.plugins.find(function(plugin) { return plugin instanceof webpack.optimize.CommonsChunkPlugin }).filenameTemplate;
        replace({
          regex: `window\\["${options.output.jsonpFunction}"\\]`,
          replacement: options.output.jsonpFunction,
          paths: [path.join(options.output.path, ccp)],
        });
      }),
    ],

    context: path.resolve(__dirname, './content'),
    entry: {
      BetterBibTeX: './BetterBibTeX.coffee',
      'BetterBibTeX.Preferences': './Preferences.coffee',
      'BetterBibTeX.ErrorReport': './ErrorReport.coffee',
      'BetterBibTeX.itemPane': './itemPane.coffee',
      'BetterBibTeX.exportOptions': './exportOptions.coffee',
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
  }),


  /*
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
  */
];

translators.forEach(function(translator) {
  translator = translator.replace(/\.json$/, '');
  var entry = {}
  entry[translator] = `./${translator}.coffee`;
  config.push(
    _.merge({}, common, {
      plugins: [
        new CircularDependencyPlugin({ failOnError: true }),
        new TranslatorHeaderPlugin(translator)
      ],
      context: path.resolve(__dirname, './resource'),
      entry: entry,

      output: {
        path: path.resolve(__dirname, './build/resource'),
        filename: '[name].js',
        devtoolLineToLine: true,
        // sourceMapFilename: "./[name].js.map",
        pathinfo: true,
      },
    }),
  )
})

module.exports = config;
