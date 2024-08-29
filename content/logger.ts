/* eslint-disable @typescript-eslint/no-empty-function, no-restricted-syntax */

import type { Translators as Translator } from '../typings/translators'
declare const TranslationWorker: { job: Translator.Worker.Job }
import { $dump, run } from './logger/simple'

import { stringify } from './stringify'
import { worker } from './client'

function toString(obj): string {
  try {
    if (typeof obj === 'string') return obj
    return stringify(obj, 0)
  }
  catch (err) {
    return stringify(err, 0)
  }
}

export const log = new class Logger {
  protected timestamp: number
  public prefix = ''

  private format({ error = false }, msg) {
    if (Array.isArray(msg)) msg = msg.map(toString).join(' ')

    let prefix = ''
    if (worker) {
      prefix += ' worker'
      if (typeof TranslationWorker !== 'undefined') prefix += `:${ TranslationWorker.job.translator }`
    }

    if (error) prefix += ' error:'

    return `{better-bibtex ${run} ${ this.prefix }${ prefix }} ${ msg }`
  }

  public get enabled(): boolean {
    return (
      (typeof TranslationWorker !== 'undefined' && TranslationWorker.job.debugEnabled)
      || !Zotero
      || Zotero.Debug?.enabled
      || Zotero.Prefs?.get('debug.store')
    ) as boolean
  }

  public debug(...msg) {
    Zotero.debug(this.format({}, msg))
  }

  public info(msg: string) {
    Zotero.debug(this.format({}, msg))
  }

  public error(...msg) {
    Zotero.debug(this.format({ error: true }, msg))
  }

  public status({ error = false }, ...msg) {
    if (error || this.enabled) Zotero.debug(this.format({ error }, msg))
  }

  public async timed(msg: string, code: () => void | Promise<void>) {
    const start = Date.now()
    await code()
    this.debug(msg, 'took', Date.now() - start, 'ms')
  }

  public dump(msg: string) {
    $dump(msg)
  }
}
