declare const doExport: () => void

importScripts('resource://gre/modules/osfile.jsm')
declare const OS: any

import XRegExp = require('xregexp')
import stringify = require('json-stringify-safe')
import { HTMLParser } from '../../content/markupparser'
import * as DateParser from '../../content/dateparser'
import * as Extra from '../../content/extra'
import { qualityReport } from '../../content/qr-check'
import { titleCase } from '../../content/title-case'
import * as itemCreators from '../../gen/item-creators.json'

const ctx: DedicatedWorkerGlobalScope = self as any

const params: { client: string, version: string, platform: string, translator: string, output: string } = (ctx.location.search || '')
  .replace(/^\?/, '') // remove leading question mark if present
  .split('&') // split into k-v pairs
  .filter(kv => kv) // there might be none
  .map(kv => kv.split('=').map(decodeURIComponent)) // decode k & v
  .reduce((acc, kv) => {
    if (kv.length === 2) acc[kv[0]] = kv[1]
    return acc
  }, { client: '', version: '', platform: '', translator: '', output: '' })

class WorkerZoteroBetterBibTeX {
  private timestamp: number

  public client() {
    return params.client
  }

  public debugEnabled() {
    return true
  }

  public cacheFetch() {
    return null
  }
  public cacheStore() {
    return true
  }

  public qrCheck(value, test, options = null) {
    return qualityReport(value, test, options)
  }

  public parseDate(date) {
    return DateParser.parse(date)
  }
  public isEDTF(date, minuteLevelPrecision = false) {
    return DateParser.isEDTF(date, minuteLevelPrecision)
  }

  public titleCase(text) {
    return titleCase(text)
  }

  public extractFields(sandbox, item) {
    return Extra.get(item.extra)
  }

  public debug(...msg) {
    let diff = null
    const now = Date.now()
    if (this.timestamp) diff = now - this.timestamp
    this.timestamp = now

    let _msg = ''
    for (const m of msg) {
      const type = typeof m
      if (type === 'string' || m instanceof String || type === 'number' || type === 'undefined' || type === 'boolean' || m === null) {
        _msg += m
      } else if (m instanceof Error) {
        _msg += `<Error: ${m.message || m.name}${m.stack ? `\n${m.stack}` : ''}>`
      } else if (m && type === 'object' && m.message) { // mozilla exception, no idea on the actual instance type
        // message,fileName,lineNumber,column,stack,errorCode
        _msg += `<Error: ${m.message}#\n${m.stack}>`
      } else {
        _msg += stringify(m)
      }

      _msg += ' '
    }

    Zotero.debug(`+${diff} ${_msg}`)
  }

  public parseHTML(text, options) {
    options = {
      ...options,
      exportBraceProtection: Zotero.getHiddenPref('exportBraceProtection'),
      csquotes: Zotero.getHiddenPref('csquotes'),
      exportTitleCase: Zotero.getHiddenPref('exportTitleCase'),
    }
    return HTMLParser.parse(text.toString(), options)
  }

  public strToISO(str) {
    return DateParser.strToISO(str)
  }
}

class WorkerZoteroUtilities {
  public XRegExp = XRegExp // tslint:disable-line:variable-name

  public getVersion() {
    return params.version
  }

  public text2html(str: string, singleNewlineIsParagraph: boolean) {
    str = str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    if (singleNewlineIsParagraph) {
      // \n => <p>
      str = `<p>${str.replace(/\n/g, '</p><p>').replace(/  /g, '&nbsp; ')}</p>`
    } else {
      // \n\n => <p>, \n => <br/>
      str = `<p>${str.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>').replace(/  /g, '&nbsp; ')}</p>`
    }

    return str.replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>')
  }

  public getCreatorsForType(itemType) {
    return itemCreators[(params.client as string)][itemType]
  }

  public itemToCSLJSON(item) {
    return Zotero.config.cslItems[item.itemID]
  }
}

class WorkerZotero {
  public config: BBTWorker.Config
  public output = ''
  public file: any = null
  private enc = new TextEncoder

  public Utilities = new WorkerZoteroUtilities // tslint:disable-line:variable-name
  public BetterBibTeX = new WorkerZoteroBetterBibTeX // tslint:disable-line:variable-name

  public getHiddenPref(pref) {
    return this.config.preferences[pref.replace(/^better-bibtex\./, '')]
  }

  public getOption(option) {
    return this.config.options[option]
  }

  public debug(message) {
    ctx.postMessage({ kind: 'debug', message })
  }

  public write(str) {
    if (this.file) {
      Zotero.file.write(this.enc.encode(str).buffer)
    } else {
      this.output += str
    }
  }

  public nextItem() {
    return this.config.items.shift()
  }
}

export const Zotero = new WorkerZotero // tslint:disable-line:variable-name

export function onmessage(e: { data: BBTWorker.Config }) {
  Zotero.config = e.data
  Zotero.config.preferences.platform = params.platform
  Zotero.config.preferences.client = params.client

  try {
    if (params.output) Zotero.file = OS.File.open(params.output, { write: true })
    doExport()
    if (Zotero.file) Zotero.file.close()
  } catch (err) {
    ctx.postMessage({ kind: 'error', message: `${err}`, stack: err.stack })
    return
  }
  ctx.postMessage({ kind: 'export', output: Zotero.output })
}

ctx.importScripts(`resource://zotero-better-bibtex/${params.translator}.js`)
