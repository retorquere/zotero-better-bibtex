const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const InstallRDFPlugin = require('./webpack/install-rdf-plugin');
const PreferencesPlugin = require('./webpack/preferences-plugin');
const TranslatorHeaderPlugin = require('./webpack/translator-header-plugin');
const CommonsPlugin = new webpack.optimize.CommonsChunkPlugin({ name: 'common', filename: 'common.js' })

const version = require('./webpack/version');

if (!fs.existsSync(path.join(__dirname, 'build'))) {
  fs.mkdirSync(path.join(__dirname, 'build'));
}

module.exports = [
  {
    plugins: [
      CommonsPlugin
    ],
    context: path.resolve(__dirname, './content'),
    entry: {
      "better-bibtex": './better-bibtex.coffee'
    },
    output: {
      path: path.resolve(__dirname, './build/content'),
      filename: '[name].js',
      jsonpFunction: 'webpackedBetterBibTeX',
    },
    module: {
      rules: [
        { test: /\.coffee$/, use: [ 'coffee-loader' ] },
      ]
    }
  },

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

  {
    resolveLoader: {
      alias: {
        'pegjs-loader': path.join(__dirname, './webpack/pegjs-loader'),
      },
    },
    plugins: [ new TranslatorHeaderPlugin() ],
    context: path.resolve(__dirname, './resource'),
    entry: {
      'BetterBibTeX Lossless': './BetterBibTeX Lossless.coffee',
      // 'Better BibLaTeX': './Better BibLaTeX.coffee',
      // 'Better BibTeX': './Better BibTeX.coffee',
      // 'Better BibTeX Quick Copy': './Better BibTeX Quick Copy.coffee',
      // 'Better CSL JSON': './Better CSL JSON.coffee',
      // 'Better CSL YAML': './Better CSL YAML.coffee',
      // 'Collected Notes': './Collected Notes.coffee',
    },
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
