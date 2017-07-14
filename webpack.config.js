const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const InstallRDFPlugin = require('./webpack/install-rdf');
const PreferencesPlugin = require('./webpack/preferences');
const ZipFilesPlugin = require('webpack-zip-files-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CommonsPlugin = new webpack.optimize.CommonsChunkPlugin({ name: 'common', filename: 'common.js' })

const version = require('./webpack/version');

function zip_map(root) {
  return fs.readdirSync(path.join(__dirname, root)).filter(function (f) {
    return (path.extname(f) != '.xpi');
  }).map(function(f) {
    return { src: path.join(__dirname, root, f), dist: path.relative(__dirname, f) };
  });
}

const clean = [ 'build '].concat(
  fs.readdirSync(path.join(__dirname, 'xpi')).filter(xpi => xpi.endsWith('.xpi')).map(xpi => path.join(__dirname, 'xpi', xpi))
);

module.exports = [
  // must be first because of CleanWebpackPlugin
  {
    plugins: [
      new CleanWebpackPlugin(clean),
      CommonsPlugin
    ],
    context: path.resolve(__dirname, './content'),
    entry: {
      betterbibtex: './main.coffee'
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

      new ZipFilesPlugin({
        entries: zip_map('build'),
        output: path.join(__dirname, 'xpi', `zotero-better-bibtex-${version}`),
        format: 'zip',
        ext: 'xpi',
      }),
      // only for debugging
      new ZipFilesPlugin({
        entries: zip_map('test/fixtures/debug-bridge'),
        output: path.join(__dirname, 'xpi', 'debug-bridge'),
        format: 'zip',
        ext: 'xpi',
      })
    ]
  },
];
