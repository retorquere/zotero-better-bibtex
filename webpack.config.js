const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const InstallRDFPlugin = require('./webpack/install-rdf');
const PreferencesPlugin = require('./webpack/preferences');
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
      filename: '[name].js'
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
];
