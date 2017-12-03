// tslint:disable:no-console

const fs = require('fs')
const replace = require('replace')

import * as webpack from 'webpack'
import * as path from 'path'

import './setup'

import BailPlugin from './webpack/plugins/bail'

import CircularDependencyPlugin = require('circular-dependency-plugin')
import AfterBuildPlugin = require('./webpack/plugins/after-build')
import TranslatorHeaderPlugin = require('./webpack/plugins/translator-header')
import CopyAssetsPlugin = require('copy-webpack-plugin')

const version = require('./webpack/version')
const translators = require('./gen/translators.json')
const rdf = require('./webpack/rdf')
const _ = require('lodash')

rdf()
console.log('write version'); fs.writeFileSync(path.join(__dirname, 'gen/version.js'), `module.exports = ${JSON.stringify(version)};\n`, 'utf8')

console.log("let's roll")

const common = {
  node: { fs: 'empty' },
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
      { test: /\.pegjs$/, use: [ 'pegjs-loader' ] },
      { test: /\.json$/, use: [ 'json-loader' ] },
      { test: /\.bcf$/, use: [ 'bcf-loader' ] },
      { test: /\.ts$/, exclude: [ /node_modules/ ], use: [ 'wrap-loader', 'ts-loader' ] },
    ],
  },
}

const config: webpack.Configuration[] = []

config.push(
  // main app logic
  _.merge({}, common, {
    plugins: [
      new webpack.NamedModulesPlugin(),
      new CircularDependencyPlugin({ failOnError: true }),
      new webpack.optimize.CommonsChunkPlugin({ minChunks: 2, name: 'common', filename: 'common.js' }),
      new AfterBuildPlugin((stats, options) => {
        const ccp = options.plugins.find(plugin => plugin instanceof webpack.optimize.CommonsChunkPlugin).filenameTemplate
        replace({
          regex: `window\\["${options.output.jsonpFunction}"\\]`,
          replacement: options.output.jsonpFunction,
          paths: [path.join(options.output.path, ccp)],
        })
      }),
      new CopyAssetsPlugin(
        ['content', 'locale', 'skin'].map(dir => ({ from: `../${dir}/**/*`, to: path.join(__dirname, 'build', dir) })),
        { ignore: [ '*.json', '*.ts', '*.pegjs' ], copyUnmodified: true }
      ),
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
      library: 'Zotero.[name]',
      libraryTarget: 'assign',
    },
  })
)

for (const label of Object.keys(translators.byName)) {
  config.push(
    _.merge({}, common, {
      plugins: [
        new CircularDependencyPlugin({ failOnError: true }),
        new TranslatorHeaderPlugin(label),
        BailPlugin,
      ],
      context: path.resolve(__dirname, './resource'),
      entry: { [label]: `./${label}.ts` },

      output: {
        path: path.resolve(__dirname, './build/resource'),
        filename: '[name].js',
        devtoolLineToLine: true,
        pathinfo: true,
      },
    })
  )
}

export default config
