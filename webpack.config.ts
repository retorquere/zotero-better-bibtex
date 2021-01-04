// tslint:disable:no-console

declare const OS: any

import * as webpack from 'webpack'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto'

import WrapperPlugin = require('wrapper-webpack-plugin')
import PostCompile = require('post-compile-webpack-plugin')

import * as translators from './gen/translators.json'
const _ = require('lodash')

const build = {
  uniqueName: _.startCase(require('./package.json').name).replace(/ /g, ''),
  runtime: 'build/content/webpack.js',
}

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
    // https://github.com/webpack/webpack/pull/8460/commits/a68426e9255edcce7822480b78416837617ab065
    fallback: {
      fs: false,
      assert: require.resolve('assert'),
      util: require.resolve('util'),
    },
    alias: {
      'path': path.join(__dirname, 'setup/shims/path.js')
    },
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
        new webpack.ProvidePlugin({ process: 'process/browser', }),
        new PostCompile(() => {
          if (fs.existsSync(build.runtime)) {
            let js = fs.readFileSync(build.runtime, 'utf-8')

            const prefix = `if (!Zotero.webpackChunk${build.uniqueName}) {\n\n`
            const postfix = '\n\n}\n'

            if (!js.startsWith(prefix)) js = `${prefix}${js}${postfix}`

            fs.writeFileSync(build.runtime, js)

          } else {
            console.log(`${build.runtime} does not exist -- compilation error?`)

          }
        }),
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
        path: path.resolve(__dirname, path.dirname(build.runtime)),
        filename: '[name].js',

        uniqueName: build.uniqueName,

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
          new webpack.ProvidePlugin({ process: 'process/browser', }),
          // new CircularDependencyPlugin({ failOnError: true }),
          new webpack.DefinePlugin({
            ZOTERO_TRANSLATOR_INFO: JSON.stringify(header),
          }),
          // new LogUsedFilesPlugin(label, 'translator'),
          new PostCompile(() => {
            if (fs.existsSync(`build/resource/${label}.js`)) {
              // @ts-ignore TS2339
              if (!header.configOptions) header.configOptions = {}
              const source = fs.readFileSync(`build/resource/${label}.js`)
              const checksum = crypto.createHash('sha256')
              checksum.update(source)
              // @ts-ignore TS2339
              header.configOptions.hash = checksum.digest('hex')
              // @ts-ignore TS2339
              header.lastUpdated = (new Date).toISOString().replace(/T.*/, '')
              fs.writeFileSync(`build/resource/${label}.json`, JSON.stringify(header, null, 2))
            } else {
              console.log(`build/resource/${label}.js does not exist (yet?)`)
            }
          })
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
        new webpack.ProvidePlugin({ process: 'process/browser', }),
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
