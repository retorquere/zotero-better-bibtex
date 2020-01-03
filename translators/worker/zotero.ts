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

export const params: { client: string, version: string, platform: string, translator: string, output: string } = (ctx.location.search || '')
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

  public worker() {
    return true
  }

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
    const now = Date.now()
    const diff = typeof this.timestamp === 'number' ? now - this.timestamp : ''
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

function makeDirs(path) {
  if (OS.File.exists(path) && !OS.File.stat(path).isDir) path = OS.Path.dirname(path)

  const { absolute, components } = OS.Path.split(path)

  if (!absolute) throw new Error(`Cannot make relative ${path}`)

  let partial = components.shift()
  for (const component of components) {
    partial = OS.Path.join(partial, component)
    if (OS.File.exists(partial)) {
      if (!OS.File.stat(path).isDir) throw new Error(`${partial} exists, but is not a directory`)
      break
    }
    OS.File.makeDir(partial)
  }
}

function saveFile(path, overwrite) {
  if (!Zotero.exportDirectory) return

  let target = OS.Path.Normalize(OS.Path.join(Zotero.exportDirectory, path))
  if (!target.startsWith(Zotero.exportDirectory)) throw new Error(`${path} looks like a relative path`)

  if (this.linkMode === 'imported_file' || (this.linkMode === 'imported_url' && this.contentType !== 'text/html')) {
    makeDirs(target)
    OS.File.copy(this.localPath, target, { noOverwrite: !overwrite })

  } else if (this.linkMode === 'imported_url') {
    target = OS.Path.dirname(target)
    if (!overwrite && OS.File.exists(target)) throw new Error(`${path} would overwite ${target}`)

    OS.File.removeDir(target, { ignoreAbsent: true })
    makeDirs(target)

    const snapshot = OS.Path.dirname(this.localPath)
    const iterator = new OS.File.DirectoryIterator(snapshot)
    let entry
    try {
      while (entry = iterator.next()) {
        if (entry.isDir) throw new Error(`Unexpected directory ${entry.path} in snapshot`)
        OS.File.copy(OS.Path.join(snapshot, entry.name), OS.path.join(target, entry.name), { noOverwrite: !overwrite })
      }
    } finally {
      iterator.close()
    }
  }
}

function patchAttachments(item) {
  if (item.itemType === 'attachment') {
    item.saveFile = saveFile.bind(item)
    Zotero.debug('attachment')
  } else if (item.attachments) {
    item.attachments.map(patchAttachments)
  }
}

class WorkerZotero {
  public config: BBTWorker.Config
  public output: string
  public exportDirectory: string

  public Utilities = new WorkerZoteroUtilities // tslint:disable-line:variable-name
  public BetterBibTeX = new WorkerZoteroBetterBibTeX // tslint:disable-line:variable-name

  public init(config) {
    this.config = config
    this.config.preferences.platform = params.platform
    this.config.preferences.client = params.client
    this.output = ''

    this.config.items.map(patchAttachments)

    if (params.output) {
      this.exportDirectory = OS.Path.normalize(OS.Path.dirname(params.output))
      makeDirs(this.exportDirectory)
    } else {
      this.exportDirectory = ''
    }
  }
  public done() {
    if (params.output) {
      Zotero.debug(`writing ${this.output.length} bytes to ${params.output}`)
      const encoder = new TextEncoder()
      const array = encoder.encode(this.output)
      OS.File.writeAtomic(params.output, array, {tmpPath: params.output + '.tmp'})
    } else {
      Zotero.debug(`returning ${this.output.length} bytes to caller`)
    }
  }

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
    this.output += str
  }

  public nextItem() {
    return this.config.items.shift()
  }
}

export const Zotero = new WorkerZotero // tslint:disable-line:variable-name

export function onmessage(e: { data: BBTWorker.Config }) {
  Zotero.BetterBibTeX.debug('got message:', e)
  if (e.data?.items) {
    Zotero.init(e.data)
    Zotero.BetterBibTeX.debug('starting export for', Zotero.config.items.length, 'items to', params.output || 'text' )
    doExport()
    Zotero.BetterBibTeX.debug('export done, writing')
    Zotero.done()
    Zotero.BetterBibTeX.debug('writing done, bye!')
    ctx.postMessage({ kind: 'export', output: params.output ? '' : Zotero.output })
  }
  /*
  } catch (err) {
    ctx.postMessage({ kind: 'error', message: `${err}`, stack: err.stack })
    return
  }
  */
}
