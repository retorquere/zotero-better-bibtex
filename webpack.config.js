const path = require('path');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const InstallRDFPlugin = require('./webpack/install-rdf');
const PreferencesPlugin = require('./webpack/preferences');
const ZipPlugin = require('zip-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CommonsPlugin = new webpack.optimize.CommonsChunkPlugin({ name: 'common', filename: 'common.bundle.js' })

const version = require('./webpack/version');

module.exports = [
  // must be first because of CleanWebpackPlugin
  {
    plugins: [
      new CleanWebpackPlugin(['build']),
      CommonsPlugin
    ],
    context: path.resolve(__dirname, './content'),
    entry: {
      betterbibtex: './better-bibtex.coffee'
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

  // must be last because of ZipPlugin
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
      ),
      new ZipPlugin({
        filename: `zotero-better-bibtex-${version}`,
        extension: 'xpi',
      }),
    ]
  }
];
