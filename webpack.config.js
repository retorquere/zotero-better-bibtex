var CopyWebpackPlugin = require('copy-webpack-plugin');
var InstallRDFPlugin = require('./webpack/install-rdf');
var path = require('path');

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
  ]
};
