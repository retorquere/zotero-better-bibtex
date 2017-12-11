// tslint:disable:no-console

const replace = require('replace')

import * as webpack from 'webpack'
import * as path from 'path'

import BailPlugin from './webpack/plugins/bail'

import CircularDependencyPlugin = require('circular-dependency-plugin')
import AfterBuildPlugin = require('./webpack/plugins/after-build')
import TranslatorHeaderPlugin = require('./setup/plugins/translator-header')

const translators = require('./gen/translators.json')
const _ = require('lodash')

const common = {
  node: { fs: 'empty' },
  resolveLoader: {
    alias: {
      'pegjs-loader': path.join(__dirname, './webpack/loaders/pegjs.ts'),
      'json-loader': path.join(__dirname, './webpack/loaders/json.ts'),
      'wrap-loader': path.join(__dirname, './webpack/loaders/wrap.ts'),
      'bcf-loader': path.join(__dirname, './setup/loaders/bcf.ts'),
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
