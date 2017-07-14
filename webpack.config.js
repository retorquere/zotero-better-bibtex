const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const InstallRDFPlugin = require('./webpack/install-rdf');
const ZipPlugin = require('zip-webpack-plugin');

const version = require('./webpack/version');

module.exports = {
  // context: path.join(__dirname, 'app'), // ??
  entry: './package.json',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'install.rdf'
  },
  plugins: [
    new InstallRDFPlugin(),
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
