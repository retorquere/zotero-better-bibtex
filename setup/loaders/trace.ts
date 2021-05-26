/* eslint-disable no-console */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import * as fs from 'fs'
import * as path from 'path'
import * as shell from 'shelljs'
import { filePathFilter } from 'file-path-filter'

import Injector = require('njstrace/lib/injector')
const injector = new Injector({
  emit(_kind, err) { throw err },
  log() { }, // eslint-disable-line no-empty,@typescript-eslint/no-empty-function
})

let selected = function(_filename) { return false } // eslint-disable-line prefer-arrow/prefer-arrow-functions
if (fs.existsSync(path.join(__dirname, '../../.trace.json'))) {
  const branch = process.env.TRAVIS_BRANCH || shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout.trim()
  if (branch !== 'master') {
    let trace = require('../../.trace.json')
    trace = trace[branch]
    if (trace) selected = filePathFilter(trace) as ((filename: string) => boolean)
  }
}

const tracer = `
Zotero.BBTTRacer = Zotero.BBTTRacer || {
  indent: 0,

  enter: function() {
    this.indent += 1
  },

  exit: function() {
    this.indent -= 1
  },

  prefix: function() {
    return '  '.repeat(this.indent)
  },
}

function __njsTraceEntry__(call) {
  const context = JSON.stringify(call) // call.file + ': ' + call.name
  Zotero.BBTTRacer.enter()
  Zotero.debug(Zotero.BBTTRacer.prefix() + '->' + context + (call.args || ''))
  return { context: context, start: Date.now() };
}

function __njsTraceExit__(call) {
  let report = '<-' + call.entryData.context + ' took ' + (Date.now() - call.entryData.start);
  if (call.exception) report += ' and threw an error'; // call.returnValue
  Zotero.debug(Zotero.BBTTRacer.prefix() + report)
  Zotero.BBTTRacer.exit()
}

function __njsOnCatchClause__(call) {
}
`

const logArguments = false
const logExceptions = true
export = function loader(filename, source: string): string {
  if (!selected(filename)) return source

  console.log(`!!!!!!!!!!!!!! Instrumenting ${filename} for trace logging !!!!!!!!!!!!!`)

  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  return tracer + injector.injectTracing(filename, source, logExceptions, logArguments)
}
