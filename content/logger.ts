import type { Translators as Translator } from '../typings/translators'
// workerJob and Translator must be var-hoisted by esbuild to make this work
declare var ZOTERO_TRANSLATOR_INFO: TranslatorHeader // eslint-disable-line no-var
declare const workerJob: Translator.Worker.Job

import { asciify } from './stringify'
import { environment } from './environment'
import jsesc from 'jsesc'

import type { TranslatorHeader } from '../translators/lib/translator'

class Logger {
  public verbose = false

  protected timestamp: number

  private format({ error=false, worker=0, translator='', issue=0}, msg) {
    let workername = `${worker}`
    let diff = null
    const now = Date.now()
    if (this.timestamp) diff = now - this.timestamp
    this.timestamp = now

    if (typeof msg !== 'string') {
      let output = issue ? `issue ${issue}: `: ''
      for (const m of msg) {
        const type = typeof m
        if (type === 'string' || m instanceof String || type === 'number' || type === 'undefined' || type === 'boolean' || m === null) {
          output += m
        }
        else if (m instanceof Error || m instanceof ErrorEvent || m.toString() === '[object ErrorEvent]') {
          output += this.formatError(m)
        }
        else if (m && type === 'object' && m.message) { // mozilla exception, no idea on the actual instance type
          output += this.formatError({ message: m.errorCode ? `${m.message} (${m.errorCode})` : m.message, filename: m.fileName, lineno: m.lineNumber, colno: m.column, stack: m.stack })
        }
        else if (this.verbose) {
          output += jsesc(m, { compact: false, indent: '  '})
        }
        else {
          output += jsesc(m)
        }

        output += ' '
      }
      msg = output
    }

    if (Zotero.worker) {
      if (!worker && workerJob.job) {
        worker = workerJob.job
        workername = `${workerJob.job}`
      }
      translator = translator || workerJob.translator
    }
    else {
      if (worker) workername = `${worker} (but environment is ${environment.name})`
      // Translator must be var-hoisted by esbuild for this to work
      if (!translator && typeof ZOTERO_TRANSLATOR_INFO !== 'undefined') translator = ZOTERO_TRANSLATOR_INFO.label
    }
    const prefix = ['better-bibtex', translator, error && ':error:', worker && `(worker ${workername})`].filter(p => p).join(' ')
    return `{${prefix}} +${diff} ${asciify(msg)}`
  }

  private formatError(e, indent='') {
    let msg = [e.name, e.message].filter(s => s).join(': ')
    if (e.filename || e.fileName) msg += ` in ${e.filename || e.fileName}`
    if (e.lineno || e.lineNumber) {
      msg += ` line ${e.lineno}`
      if (e.colno) msg += `, col ${e.colno}`
    }
    if (e.stack) msg += `\n${indent}${e.stack.replace(/\n/g, `${indent}\n`)}`
    if (e.error) msg += `\n${indent}${this.formatError(e.error, '  ')}\n`
    return `${indent}<Error: ${msg}>`
  }

  public get enabled(): boolean {
    if (typeof ZOTERO_TRANSLATOR_INFO === 'undefined') return Zotero.Debug.enabled as boolean
    if (!Zotero.worker) return true
    return !workerJob || workerJob.debugEnabled
  }

  public debug(...msg) {
    if (this.enabled) Zotero.debug(this.format({}, msg))
  }

  public for(issue: number, ...msg) {
    if (this.enabled) Zotero.debug(this.format({ issue }, msg))
  }

  public error(...msg) {
    Zotero.debug(this.format({error: true}, msg))
  }
  public status({ error=false, worker=0, translator='' }, ...msg) {
    if (error || this.enabled) Zotero.debug(this.format({error, worker, translator}, msg))
  }
}

export const log = new Logger
