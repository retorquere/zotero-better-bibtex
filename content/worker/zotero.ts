/* eslint-disable @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */

const ctx: DedicatedWorkerGlobalScope = self as any

export const workerEnvironment = {
  version: '',
  platform: '',
  locale: '',
}

for(const [key, value] of (new URLSearchParams(ctx.location.search)).entries()) {
  workerEnvironment[key] = value
}

declare const dump: (message: string) => void

importScripts('resource://gre/modules/osfile.jsm')
importScripts('resource://zotero/config.js') // import ZOTERO_CONFIG'

import { client, clientName } from '../../content/client'
import type { TranslatorMetadata } from '../../translators/lib/translator'
import type { Translators } from '../../typings/translators'
import { valid } from '../../gen/items/items'
import { generateBibLaTeX } from '../../translators/bibtex/biblatex'
import { generateBibTeX } from '../../translators/bibtex/bibtex'
import { generateCSLJSON } from '../../translators/csl/json'
import { generateCSLYAML, parseCSLYAML } from '../../translators/csl/yaml'
import { Translation } from '../../translators/lib/translator'

import { DOMParser as XMLDOMParser } from '@xmldom/xmldom'

declare var ZOTERO_TRANSLATOR_INFO: TranslatorMetadata // eslint-disable-line no-var

const NodeType = {
  ELEMENT_NODE                : 1,
  ATTRIBUTE_NODE              : 2,
  TEXT_NODE                   : 3,
  CDATA_SECTION_NODE          : 4,
  ENTITY_REFERENCE_NODE       : 5,
  ENTITY_NODE                 : 6,
  PROCESSING_INSTRUCTION_NODE : 7,
  COMMENT_NODE                : 8,
  DOCUMENT_NODE               : 9,
  DOCUMENT_TYPE_NODE          : 10,
  DOCUMENT_FRAGMENT_NODE      : 11,
  NOTATION_NODE               : 12,
}

const childrenProxy = {
  get(target, prop) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    if (prop === Symbol.iterator) {
      return function*() {
        let child = target.firstChild
        while (child) {
          if (child.childNodes) yield child
          child = child.nextSibling
        }
      }
    }
    const children = Array.from(target.childNodes).filter((child: any) => child.childNodes)
    Zotero.debug(`proxy:children[${typeof prop === 'symbol' ? prop.toString() : prop}]`)
    return children[prop]
  },

  set(target, prop, _value) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    throw new Error(`cannot set unsupported children.${prop}`)
  },
}

const domParser = new XMLDOMParser
function upgrade(root) {
  if (!root.children) {
    Object.defineProperty(root, 'children', {
      get() {
        return new Proxy(this, childrenProxy)
      },
    })
  }

  if (!root.innerHTML) {
    Object.defineProperty(root, 'innerHTML', {
      get() {
        return this.childNodes?.toString()
      },
    })
  }

  if (!root.insertAdjacentHTML) {
    root.insertAdjacentHTML = function(position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend', text: string) {
      (position as string) = position.toLowerCase()

      let context
      switch (position) {
        case 'beforebegin':
        case 'afterend':
          context = this.parentNode
          if (context === null || context.nodeType === NodeType.DOCUMENT_NODE) {
            throw new Error('Cannot insert HTML adjacent to parent-less nodes or children of document nodes.')
          }
          break

        case 'afterbegin':
        case 'beforeend':
          context = this // eslint-disable-line @typescript-eslint/no-this-alias
          break

        default:
          throw new Error('Must provide one of "beforebegin", "afterbegin", "beforeend", or "afterend".')
      }

      const fragment = domParser.parseFromString(`<span>${text}</span>`, 'text/html').documentElement

      switch (position) {
        case 'beforebegin':
          this.parentNode.insertBefore(fragment, this)
          break

        case 'afterbegin':
          this.insertBefore(fragment, this.firstChild)
          break

        case 'beforeend':
          this.appendChild(fragment)
          break

        case 'afterend':
          this.parentNode.insertBefore(fragment, this.nextSibling)
          break
      }
    }
  }

  return root
}
import { Node as XMLDOMNode } from '@xmldom/xmldom/lib/dom'
upgrade(XMLDOMNode.prototype)

export class DOMParser extends XMLDOMParser {
  parseFromString(text: string, contentType: string) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return upgrade(super.parseFromString(text, contentType))
  }
}

const ZU = require('../../submodules/zotero-utilities/utilities.js')
const ZUI = require('../../submodules/zotero-utilities/utilities_item.js')
const ZD = require('../../submodules/zotero-utilities/date.js')

declare const doExport: () => void

import * as DateParser from '../../content/dateparser'
// import * as Extra from '../../content/extra'
import itemCreators from '../../gen/items/creators.json'
import { log } from '../../content/logger'
import { Collection } from '../../gen/typings/serialized-item'
// import { CSL_MAPPINGS } from '../../gen/items/items'

import zotero_schema from '../../schema/zotero.json'
import jurism_schema from '../../schema/jurism.json'
const schema = client === 'zotero' ? zotero_schema : jurism_schema
import dateFormats from '../../schema/dateFormats.json'

export const workerJob: Partial<Translators.Worker.Job> = {}

function cacheFetch(_translator: string, itemID: number, _options: any, _prefs: any) {
  // ignore all the other cacheFetch params because we have a targetted cache here
  return workerJob.data.cache[itemID]
}
function cacheStore(_translator: string, itemID: number, _options: any, _prefs: any, entry: string, metadata: any) {
  if (workerJob.preferences.cache) Zotero.send({ kind: 'cache', itemID, entry, metadata })
  return true
}

class WorkerZoteroBetterBibTeX {
  public clientName = clientName
  public client = client
  public worker = true

  public Cache = {
    store: cacheStore,
    fetch: cacheFetch,
  }

  public setProgress(percent: number) {
    Zotero.send({ kind: 'progress', percent, translator: workerJob.translator, autoExport: workerJob.autoExport })
  }

  public getContents(path: string): string {
    if (path && OS.File.exists(path)) {
      // https://contest-server.cs.uchicago.edu/ref/JavaScript/developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/OSFile.jsm/OS-2.html
      const array = OS.File.read(path)
      const decoder = new TextDecoder()
      return decoder.decode(array as BufferSource)
    }
    else {
      return null
    }
  }

  public cacheFetch(itemID: number) {
    return cacheFetch('', itemID, null, null)
  }

  public cacheStore(itemID: number, _options: any, _prefs: any, entry: string, metadata: any) {
    return cacheStore('', itemID, null, null, entry, metadata)
  }

  public parseDate(date) {
    return DateParser.parse(date)
  }

  public isEDTF(date, minuteLevelPrecision = false) {
    return DateParser.isEDTF(date, minuteLevelPrecision)
  }

  /*
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
  */

  public strToISO(str) {
    return DateParser.strToISO(str)
  }

  public generateBibLaTeX(translation: Translation) { generateBibLaTeX(translation) }
  public generateBibTeX(translation: Translation) { generateBibTeX(translation) }
  generateCSLYAML(translation: Translation) { generateCSLYAML(translation) }
  generateCSLJSON(translation: Translation) { generateCSLJSON(translation) }
  parseCSLYAML(input: string): any { return parseCSLYAML(input) }
}

const WorkerZoteroUtilities = {
  ...ZU,
  Item: ZUI,

  getVersion: () => workerEnvironment.version,

  /*
  public getCreatorsForType(itemType) {
    return itemCreators[client][itemType]
  }

  public itemToCSLJSON(item) {
    return workerJob.cslItems[item.itemID]
  }
  */
}

function isWinRoot(path) {
  return workerEnvironment.platform === 'win' && path.match(/^[a-z]:\\?$/i)
}
function makeDirs(path) {
  if (isWinRoot(path)) return
  if (!OS.Path.split(path).absolute) throw new Error(`Will not create relative ${path}`)

  path = OS.Path.normalize(path)

  const paths: string[] = []
  // path === paths[0] means we've hit the root, as the dirname of root is root
  while (path !== paths[0] && !isWinRoot(path) && !OS.File.exists(path)) {
    paths.unshift(path)
    path = OS.Path.dirname(path)
  }

  if (!isWinRoot(path) && !(OS.File.stat(path) as OS.File.FileInfo).isDir) throw new Error(`makeDirs: root ${path} is not a directory`)

  for (path of paths) {
    OS.File.makeDir(path) as void
  }
}

function saveFile(path, overwrite) {
  if (!Zotero.exportDirectory) return false

  if (!OS.File.exists(this.localPath)) return false

  this.path = OS.Path.normalize(OS.Path.join(Zotero.exportDirectory, path))
  if (!this.path.startsWith(Zotero.exportDirectory)) throw new Error(`${path} looks like a relative path`)

  if (this.linkMode === 'imported_file' || (this.linkMode === 'imported_url' && this.contentType !== 'text/html')) {
    makeDirs(OS.Path.dirname(this.path))
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    OS.File.copy(this.localPath, this.path, { noOverwrite: !overwrite })
  }
  else if (this.linkMode === 'imported_url') {
    const target = OS.Path.dirname(this.path)
    if (!overwrite && OS.File.exists(target)) throw new Error(`${path} would overwite ${target}`)

    OS.File.removeDir(target, { ignoreAbsent: true })
    makeDirs(target)

    const snapshot = OS.Path.dirname(this.localPath)
    const iterator = new OS.File.DirectoryIterator(snapshot)
    // PITA dual-type OS.Path is promises on main thread but sync in worker
    iterator.forEach(entry => { // eslint-disable-line @typescript-eslint/no-floating-promises
      if (entry.isDir) throw new Error(`Unexpected directory ${entry.path} in snapshot`)
      if (entry.name !== '.zotero-ft-cache') {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        OS.File.copy(OS.Path.join(snapshot, entry.name), OS.Path.join(target, entry.name), { noOverwrite: !overwrite })
      }
    })
  }

  return true
}

class WorkerZoteroCreatorTypes {
  public getTypesForItemType(itemTypeID: string): { name: string } {
    return itemCreators[client][itemTypeID]?.map(name => ({ name })) || []
  }

  public isValidForItemType(creatorTypeID, itemTypeID) {
    return itemCreators[client][itemTypeID]?.includes(creatorTypeID)
  }

  public getLocalizedString(type: string): string {
    return schema.locales[Zotero.locale]?.types[type] || type[0].toUpperCase() + type.substr(1).replace(/([A-Z])([a-z])/g, (m, u, l) => `${u.toLowerCase()} ${l}`)
  }

  public getPrimaryIDForType(typeID) {
    return itemCreators[client][typeID]?.[0]
  }

  public getID(typeName) {
    return typeName
  }
  public getName(typeID) {
    return typeID
  }
}

class WorkerZoteroItemTypes {
  public getID(type: string): string { // bit of a hack to return a string, but this is all in an emulated Zotero anyway
    return type
  }
}

class WorkerZoteroItemFields {
  public isValidForType(fieldID: string, itemTypeID: string) {
    return valid.field[itemTypeID]?.[fieldID]
  }

  public getID(field: string): string {
    return field
  }

  public getFieldIDFromTypeAndBase(_itemTypeID: string, fieldID: string): string {
    // assumes normalized item
    return fieldID
  }

  public getName(itemFieldID: string) {
    return itemFieldID
  }

  public getBaseIDFromTypeAndField(_typeID: string, fieldID: string) {
    // assumes normalized item
    return fieldID
  }
}

class WorkerZotero {
  public worker = true

  public output: string
  public exportDirectory: string
  public exportFile: string
  private items = 0

  public Utilities = WorkerZoteroUtilities
  public BetterBibTeX = new WorkerZoteroBetterBibTeX // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public CreatorTypes = new WorkerZoteroCreatorTypes
  public ItemTypes  = new WorkerZoteroItemTypes
  public ItemFields  = new WorkerZoteroItemFields
  public Date = ZD
  public Schema: any

  public init() {
    this.Date.init(dateFormats)

    workerJob.preferences.platform = workerEnvironment.platform
    workerJob.preferences.client = client
    this.output = ''
    this.items = workerJob.data.items.length

    if (workerJob.options.exportFileData) {
      for (const item of workerJob.data.items) {
        this.patchAttachments(item)
      }
    }

    if (workerJob.output) {
      if (workerJob.options.exportFileData) { // output path is a directory
        this.exportDirectory = OS.Path.normalize(workerJob.output)
        this.exportFile = OS.Path.join(this.exportDirectory, `${OS.Path.basename(this.exportDirectory)}.${ZOTERO_TRANSLATOR_INFO.target}`)
      }
      else {
        this.exportFile = OS.Path.normalize(workerJob.output)
        const ext = `.${ZOTERO_TRANSLATOR_INFO.target}`
        if (!this.exportFile.endsWith(ext)) this.exportFile += ext
        this.exportDirectory = OS.Path.dirname(this.exportFile)
      }
      makeDirs(this.exportDirectory)
    }
    else {
      this.exportFile = ''
      this.exportDirectory = ''
    }
  }

  public done() {
    if (this.exportFile) {
      const encoder = new TextEncoder()
      const array = encoder.encode(this.output)
      OS.File.writeAtomic(this.exportFile, array) as void
    }
    this.send({ kind: 'done', output: this.exportFile ? true : this.output })
  }

  public send(message: Translators.Worker.Message) {
    ctx.postMessage(message)
  }

  public get locale() {
    return workerEnvironment.locale
  }

  public getHiddenPref(pref) {
    return workerJob.preferences[pref.replace(/^better-bibtex\./, '')]
  }

  public getOption(option) {
    return workerJob.options[option]
  }

  public debug(message) {
    if (workerJob.debugEnabled) {
      this.send({ kind: 'debug', message })
    }
  }
  public logError(err) {
    dump(`worker: error: ${err}\n${err.stack}\n`)
    this.send({ kind: 'error', message: `${err}\n${err.stack}` })
  }

  public write(str) {
    this.output += str
  }

  public nextItem() {
    this.send({ kind: 'item', item: this.items - workerJob.data.items.length })
    return workerJob.data.items.shift()
  }

  public nextCollection(): Collection {
    return workerJob.data.collections.shift()
  }

  private patchAttachments(item): void {
    if (item.itemType === 'attachment') {
      item.saveFile = saveFile.bind(item)

      if (!item.defaultPath && item.localPath) { // why is this not set by itemGetter?!
        item.defaultPath = `files/${item.itemID}/${OS.Path.basename(item.localPath)}`
      }

    }
    else if (item.attachments) {
      for (const att of item.attachments) {
        this.patchAttachments(att)
      }
    }
  }
}

// haul to top
export var Zotero = new WorkerZotero // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match,no-var

const dec = new TextDecoder('utf-8')
ctx.onmessage = function(e: { isTrusted?: boolean, data?: Translators.Worker.Message } ): void { // eslint-disable-line prefer-arrow/prefer-arrow-functions
  if (!e.data) return // some kind of startup message

  try {
    switch (e.data.kind) {
      case 'initialize':
        Zotero.Schema = { ...e.data.CSL_MAPPINGS }
        break

      case 'start':
        Object.assign(workerJob, JSON.parse(dec.decode(new Uint8Array(e.data.config))))
        importScripts(`chrome://zotero-better-bibtex/content/resource/${workerJob.translator}.js`)
        Zotero.init()
        doExport()
        Zotero.done()
        break

      case 'stop':
        break

      case 'ping':
        ctx.postMessage({ kind: 'ping' })
        break

      default:
        log.error('unexpected message:', e)
        break
    }
  }
  catch (err) {
    Zotero.logError(err)
  }
}
