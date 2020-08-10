declare const doExport: () => void
declare const Translator: ITranslator

importScripts('resource://gre/modules/osfile.jsm')
declare const OS: any

import XRegExp = require('xregexp')
import { HTMLParser } from '../../content/markupparser'
import * as DateParser from '../../content/dateparser'
// import * as Extra from '../../content/extra'
import { qualityReport } from '../../content/qr-check'
import { titleCase } from '../../content/case'
import * as itemCreators from '../../gen/items/creators.json'
import { client } from '../../content/client'
import { log } from '../../content/logger'

const ctx: DedicatedWorkerGlobalScope = self as any

export const params = {
  version: '',
  platform: '',
  translator: '',
  output: '',
  localeDateOrder: '',
  debugEnabled: false,
}
for(const [key, value] of (new URLSearchParams(ctx.location.search)).entries()) {
  if (key === 'debugEnabled') {
    params[key] = value === 'true'
  } else {
    params[key] = value
  }
}

class WorkerZoteroBetterBibTeX {
  public localeDateOrder: string

  public debugEnabled() {
    return params.debugEnabled
  }

  public cacheFetch(itemID: number) {
    return Zotero.config.cache[itemID]
  }

  public cacheStore(itemID: number, options: any, prefs: any, reference: string, metadata: any) {
    Zotero.send({ kind: 'cache', itemID, reference, metadata })
    return true
  }

  public qrCheck(value, test, options = null) {
    return qualityReport(value, test, options)
  }

  public parseDate(date) {
    return DateParser.parse(date, params.localeDateOrder)
  }
  public getLocaleDateOrder() {
    return params.localeDateOrder
  }

  public isEDTF(date, minuteLevelPrecision = false) {
    return DateParser.isEDTF(date, minuteLevelPrecision)
  }

  public titleCase(text) {
    return titleCase(text)
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
    return DateParser.strToISO(str, params.localeDateOrder)
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
    return itemCreators[client][itemType]
  }

  public itemToCSLJSON(item) {
    return Zotero.config.cslItems[item.itemID]
  }
}

function makeDirs(path) {
  if (!OS.Path.split(path).absolute) throw new Error(`Will not make relative ${path}`)

  path = OS.Path.normalize(path)

  const paths: string[] = []
  while (path !== paths[0] && !OS.File.exists(path)) {
    paths.unshift(path)
    path = OS.Path.dirname(path)
  }

  if (!OS.File.stat(path).isDir) throw new Error(`makeDirs: root ${path} is not a directory`)

  for (path of paths) {
    OS.File.makeDir(path)
  }
}

function saveFile(path, overwrite) {
  if (!Zotero.exportDirectory) return false

  if (!OS.File.exists(this.localPath)) return false

  this.path = OS.Path.normalize(OS.Path.join(Zotero.exportDirectory, path))
  if (!this.path.startsWith(Zotero.exportDirectory)) throw new Error(`${path} looks like a relative path`)

  if (this.linkMode === 'imported_file' || (this.linkMode === 'imported_url' && this.contentType !== 'text/html')) {
    makeDirs(OS.Path.dirname(this.path))
    OS.File.copy(this.localPath, this.path, { noOverwrite: !overwrite })

  } else if (this.linkMode === 'imported_url') {
    const target = OS.Path.dirname(this.path)
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

  return true
}

class WorkerZotero {
  public config: BBTWorker.Config
  public output: string
  public exportDirectory: string
  public exportFile: string

  public Utilities = new WorkerZoteroUtilities // tslint:disable-line:variable-name
  public BetterBibTeX = new WorkerZoteroBetterBibTeX // tslint:disable-line:variable-name

  public init(config) {
    this.config = config
    this.config.preferences.platform = params.platform
    this.config.preferences.client = client
    this.output = ''

    if (this.config.options.exportFileData) {
      for (const item of this.config.items) {
        this.patchAttachments(item)
      }
    }

    if (params.output) {
      if (this.config.options.exportFileData) { // output path is a directory
        this.exportDirectory = OS.Path.normalize(params.output)
        this.exportFile = OS.Path.join(this.exportDirectory, `${OS.Path.basename(this.exportDirectory)}.${Translator.header.target}`)
      } else {
        this.exportFile = OS.Path.normalize(params.output)
        const ext = `.${Translator.header.target}`
        if (!this.exportFile.endsWith(ext)) this.exportFile += ext
        this.exportDirectory = OS.Path.dirname(this.exportFile)
      }
      makeDirs(this.exportDirectory)
    } else {
      this.exportFile = ''
      this.exportDirectory = ''
    }
  }

  public done() {
    if (this.exportFile) {
      const encoder = new TextEncoder()
      const array = encoder.encode(this.output)
      OS.File.writeAtomic(this.exportFile, array, {tmpPath: this.exportFile + '.tmp'})
    }
    this.send({ kind: 'done', output: this.exportFile ? true : this.output })
  }

  public send(message: BBTWorker.Message) {
    ctx.postMessage(message)
  }

  public getHiddenPref(pref) {
    return this.config.preferences[pref.replace(/^better-bibtex\./, '')]
  }

  public getOption(option) {
    return this.config.options[option]
  }

  public debug(message) {
    this.send({ kind: 'debug', message })
  }
  public logError(err) {
    this.send({ kind: 'error', message: `${err}\n${err.stack}` })
  }

  public write(str) {
    this.output += str
  }

  public nextItem() {
    this.send({ kind: 'item' })
    return this.config.items.shift()
  }

  public nextCollection() {
    return this.config.collections.shift()
  }

  private patchAttachments(item) {
    if (item.itemType === 'attachment') {
      item.saveFile = saveFile.bind(item)

      if (!item.defaultPath && item.localPath) { // why is this not set by itemGetter?!
        item.defaultPath = `files/${item.itemID}/${OS.Path.basename(item.localPath)}`
      }

    } else if (item.attachments) {
      for (const att of item.attachments) {
        this.patchAttachments(att)
      }

    }
  }
}

export const Zotero = new WorkerZotero // tslint:disable-line:variable-name

export function onmessage(e: { data: BBTWorker.Config }) {
  Zotero.BetterBibTeX.localeDateOrder = params.localeDateOrder

  if (e.data?.items && !Zotero.config) {
    try {
      Zotero.init(e.data)
      doExport()
      Zotero.done()
    } catch (err) {
      Zotero.logError(err)
    }
  } else {
    log.debug('unexpected message in worker:', e)
  }
  close()
}
