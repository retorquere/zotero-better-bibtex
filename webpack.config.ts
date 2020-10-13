// tslint:disable:no-console

declare const OS: any

import * as webpack from 'webpack'
import * as path from 'path'

// import CircularDependencyPlugin = require('circular-dependency-plugin')
import WrapperPlugin = require('wrapper-webpack-plugin')

import * as translators from './gen/translators.json'
const _ = require('lodash')

const common = {
  mode: 'development',
  devtool: false,
  optimization: {
    flagIncludedChunks: true,
    usedExports: true,
    minimize: false,
    concatenateModules: false,
    emitOnErrors: false,
    moduleIds: 'named',
    chunkIds: 'named',
    // runtimeChunk: false,
  },

  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      fs: false,
      path: {
        join() {
          return OS.Path.join.apply(null, arguments)
        }
      }
    }
  },

  // node: { fs: 'empty' },
  resolveLoader: {
    alias: {
      'pegjs-loader': 'zotero-plugin/loader/pegjs',
      // 'json-jsesc-loader': 'zotero-plugin/loader/json',
      'bcf-loader': path.join(__dirname, './setup/loaders/bcf.ts'),
      'trace-loader': path.join(__dirname, './setup/loaders/trace.ts'),
    },
  },
  module: {
    rules: [
      { test: /\.pegjs$/, use: [ 'pegjs-loader' ] },
      // { test: /\.json$/, type: 'javascript/auto', use: [ 'json-jsesc-loader' ] }, // https://github.com/webpack/webpack/issues/6572
      { test: /\.bcf$/, use: [ 'bcf-loader' ] },
      { test: /\.ts$/, exclude: [ /node_modules/ ], use: [ 'trace-loader', 'ts-loader' ] },
    ],
  },
}

const config: webpack.Configuration[] = []

if (!process.env.MINITESTS) {
  config.push(
    // main app logic
    _.merge({}, common, {
      optimization: {
        splitChunks: {
          // name: true,
          cacheGroups: {
            common: {
              name: 'common',
              chunks: 'all',
              // minSize: 1,
              minChunks: 2,
              enforce: true,
              priority: 10,
            },
          },
        },
        runtimeChunk: {
          name: 'webpack'
        },
      },
      plugins: [
        // new CircularDependencyPlugin({ failOnError: true }),
      ],

      context: path.resolve(__dirname, './content'),
      entry: {
        BetterBibTeX: './BetterBibTeX.ts',
        'BetterBibTeX.ZoteroPane': './ZoteroPane.ts',
        'BetterBibTeX.KeyManager': './KeyManager.ts',
        'BetterBibTeX.TestSupport': './TestSupport.ts',
        'BetterBibTeX.Preferences': './Preferences.ts',
        'BetterBibTeX.ErrorReport': './ErrorReport.ts',
        'BetterBibTeX.FirstRun': './FirstRun.ts',
        'BetterBibTeX.ItemPane': './ItemPane.ts',
        'BetterBibTeX.ExportOptions': './ExportOptions.ts',
      },
      // devtool: '#source-map',
      output: {
        globalObject: 'Zotero',
        path: path.resolve(__dirname, './build/content'),
        filename: '[name].js',

        // jsonpFunction: 'WebPackedBetterBibTeX',
        uniqueName: 'BetterBibTeX',

        // chunkFilename: "[id].chunk.js",
        // sourceMapFilename: "./[name].js.map",
        pathinfo: true,
        library: 'Zotero.[name]',
        libraryTarget: 'assign',
      },
    })
  )

  for (const [label, header] of Object.entries(translators.byName)) {
    const vars = ['Translator']
      .concat((header.translatorType & 1) ? ['detectImport', 'doImport'] : [])
      .concat((header.translatorType & 2) ? ['doExport'] : [])
      .join(', ')

    config.push(
      _.merge({}, common, {
        plugins: [
          // new CircularDependencyPlugin({ failOnError: true }),
          new webpack.DefinePlugin({
            ZOTERO_TRANSLATOR_INFO: JSON.stringify(header),
          }),
          // new LogUsedFilesPlugin(label, 'translator'),
        ],
        context: path.resolve(__dirname, './translators'),
        entry: { [label]: `./${label}.ts` },

        output: {
          // jsonpFunction: `WebPacked${label.replace(/ /g, '')}`,
          uniqueName: `Translator${label}`.replace(/ /g, ''),
          path: path.resolve(__dirname, './build/resource'),
          filename: '[name].js',
          pathinfo: true,
          library: `var {${vars}}`,
          libraryTarget: 'assign',
        },
      })
    )
  }

  config.push(
    _.merge({}, common, {
      plugins: [
        // new CircularDependencyPlugin({ failOnError: true }),
        new WrapperPlugin({
          test: /\.js$/,
          // otherwise these would be contained in the webpack IIFE
          header: 'importScripts("resource://zotero/config.js") // import ZOTERO_CONFIG\n\n',
          footer: '\nimportScripts(`resource://zotero-better-bibtex/${params.translator}.js`);\n',
        })
      ],
      context: path.resolve(__dirname, './translators'),
      entry: { Zotero: './worker/zotero.ts' },

      output: {
        // jsonpFunction: 'WebPackedZoteroShim',
        uniqueName: 'BetterBibTeXZoteroShim',
        path: path.resolve(__dirname, './build/resource/worker'),
        filename: '[name].js',
        pathinfo: true,
        library: 'var { Zotero, onmessage, params }',
        libraryTarget: 'assign',
      },
    })
  )
}

if (process.env.MINITESTS) {
  config.length = 0
  for (const minitest of process.env.MINITESTS.split(' ')) {
    config.push(
      _.merge({}, common, {
        plugins: [
          // new CircularDependencyPlugin({ failOnError: true }),
          new webpack.NormalModuleReplacementPlugin(/.*/, function(resource) {
            resource.request = resource.request
              .replace(/\/prefs.ts$/, '/minitests/prefs.ts')
              .replace(/\/title-case.ts$/, '/minitests/title-case.ts')
          }),
          new webpack.DefinePlugin({
            'Zotero.debug': 'console.log',
            'Zotero.Debug.enabled': 'true',
            'Components.utils.import': 'console.log',
            'ZOTERO_CONFIG': '{}',
            'Services.appinfo.name': '"Zotero"',
            'Services.appinfo.version': '"0.0"',
            'Zotero.version': '"0.0"',
            'Zotero.platform': '"node"',
            'Zotero.oscpu': '"node"',
            'Zotero.locale': '"locale"',
            'Zotero.logError': 'undefined',
          }),
          new webpack.NormalModuleReplacementPlugin(/\.\/prefs/, '../minitests/prefs.js'),
          new webpack.NormalModuleReplacementPlugin(/\.\/title-case/, '../minitests/title-case.js'),
        ],
        context: path.resolve(__dirname, './minitests'),
        entry: { [minitest]: `./${minitest}.ts` },

        output: {
          path: path.resolve(__dirname, './build/minitest'),
          filename: '[name].js',
          pathinfo: true,
        },
      })
    )
  }
}

export default config
