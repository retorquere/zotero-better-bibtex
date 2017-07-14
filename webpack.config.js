const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const InstallRDFPlugin = require('./webpack/install-rdf');
const PreferencesPlugin = require('./webpack/preferences');
const ZipPlugin = require('zip-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const version = require('./webpack/version');

module.exports = {
  // context: path.join(__dirname, 'app'), // ??
  entry: './package.json',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'install.rdf'
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
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
};
