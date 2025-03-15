/* eslint-disable @typescript-eslint/no-unsafe-return */

// import registerPromiseWorker from '@kotorik/promise-worker/register'
import { Server as WorkerServerBase } from './json-rpc'
import { Exporter } from './interface'

import allSettled = require('promise.allsettled')
allSettled.shim()

import { ExportedItemMetadata, Cache, Context, Running } from '../db/cache'

import flatMap from 'array.prototype.flatmap'
flatMap.shim()
import matchAll from 'string.prototype.matchall'
matchAll.shim()

declare const IOUtils: any

import * as client from '../client'
import { Path, File } from '../file'

const ctx: DedicatedWorkerGlobalScope = self as any

importScripts('resource://zotero/config.js') // import ZOTERO_CONFIG'

import type { Message, Job } from '../translators/worker'
import type { Translators } from '../../typings/translators'
import { valid } from '../../gen/items/items'
import { generateBibLaTeX } from '../../translators/bibtex/biblatex'
import { generateBibTeX } from '../../translators/bibtex/bibtex'
import { generateCSLJSON } from '../../translators/csl/json'
import { generateCSLYAML } from '../../translators/csl/yaml'
import { generateBBTJSON } from '../../translators/lib/bbtjson'
import type { Collected } from '../../translators/lib/collect'
import XRegExp from 'xregexp'

import { DOMParser as XMLDOMParser } from '@xmldom/xmldom'

declare var ZOTERO_TRANSLATOR_INFO: Translators.Header // eslint-disable-line no-var

const NodeType = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12,
}

const childrenProxy = {
  get(target, prop) {
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
    return children[prop]
  },

  set(target, prop, _value) {
    throw new Error(`cannot set unsupported children.${ prop }`)
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

      const fragment = domParser.parseFromString(`<span>${ text }</span>`, 'text/html' as unknown as any).documentElement

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
  parseFromString(text: string, contentType: any) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
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
const schema = client.slug === 'zotero' ? zotero_schema : jurism_schema
import dateFormats from '../../schema/dateFormats.json'

export const TranslationWorker: { job?: Partial<Job> } = {}

class WorkerZoteroBetterBibTeX {
  public clientName = client.name
  public client = client.slug
  public worker = true

  public Cache = {
    store(itemID: number, entry: string, metadata: ExportedItemMetadata) {
      Zotero.running?.store({ itemID, entry, metadata })
    },
    fetch(itemID: number) {
      return Zotero.running?.fetch(itemID)
    },
  }

  public setProgress(percent: number) {
    Zotero.send({ kind: 'progress', percent, translator: TranslationWorker.job.translator, autoExport: TranslationWorker.job.autoExport })
  }

  public getContents(path: string): string {
    if (!path) return null

    try {
      const file = IOUtils.openFileForSyncReading(path)
      const chunkSize = 64
      const bytes = new Uint8Array(chunkSize)
      const decoder = new TextDecoder('utf-8')
      let offset = 0
      const size = file.size

      let text = ''
      while (offset < size) {
        const len = Math.min(chunkSize, size - offset)
        const chunk = len > chunkSize ? bytes : bytes.subarray(0, len)
        file.readBytesInto(chunk, offset)
        text += decoder.decode(chunk)
        offset += len
      }

      file.close()
      return text
    }
    catch (err) {
      if (!err.message?.includes('NS_ERROR_FILE_NOT_FOUND')) {
        log.error(`getContents ${ path } error ${ err } ${ Object.keys(err) } ${ err.message }`)
      }
      return null
    }
  }

  public parseDate(date) {
    return DateParser.parse(date)
  }

  public isEDTF(date, minuteLevelPrecision = false) {
    return DateParser.isEDTF(date, minuteLevelPrecision)
  }

  public strToISO(str) {
    return DateParser.strToISO(str)
  }

  public generateBibLaTeX(collected: Collected) { return generateBibLaTeX(collected) }
  public generateBibTeX(collected: Collected) { return generateBibTeX(collected) }
  public generateCSLYAML(collected: Collected) { return generateCSLYAML(collected) }
  public generateCSLJSON(collected: Collected) { return generateCSLJSON(collected) }
  public generateBBTJSON(collected: Collected) { return generateBBTJSON(collected) }
}

const WorkerZoteroUtilities = {
  ...ZU,
  Item: ZUI,
  XRegExp,

  getVersion: () => client.version,
}

async function makeDirs(path) {
  if (!Path.isAbsolute(path)) throw new Error(`Will not create relative ${ path }`)
  await IOUtils.makeDirectory(path, { ignoreExisting: true, createAncestors: true })
}

async function saveFile(path, overwrite) {
  if (!Zotero.exportDirectory) return false

  const protect = overwrite
    ? async function(_tgt: string, _src?: string) {} // eslint-disable-line @typescript-eslint/no-empty-function
    : async function(tgt: string, src?: string) {
      if (await File.exists(tgt)) {
        if ((src || tgt) === tgt) {
          throw new Error(`save to ${JSON.stringify(tgt)} would overwite existing file`)
        }
        else {
          throw new Error(`copy of ${JSON.stringify(src)} to ${JSON.stringify(tgt)} would overwite existing file`)
        }
      }
    }

  if (!await File.exists(this.localPath)) return false

  try {
    this.path = PathUtils.join(Zotero.exportDirectory, path)
  }
  catch (err) {
    log.error('3125: failed to join', { exportDirectory: Zotero.exportDirectory, path }, err)
  }
  if (!this.path.startsWith(Zotero.exportDirectory)) throw new Error(`${path} looks like a relative path`)

  if (this.linkMode === 'imported_file' || (this.linkMode === 'imported_url' && this.contentType !== 'text/html')) {
    await protect(this.path, this.localPath)
    await makeDirs(PathUtils.parent(this.path))
    await IOUtils.copy(this.localPath, this.path)
  }
  else if (this.linkMode === 'imported_url') {
    const target = PathUtils.parent(this.path)
    await protect(target, this.localPath)

    await IOUtils.remove(target, { recursive: true, ignoreAbsent: true })
    await makeDirs(target)

    const snapshot = PathUtils.parent(this.localPath)
    for (const src of await IOUtils.getChildren(snapshot)) {
      if (PathUtils.filename(src) === '.zotero-ft-cache') continue
      if (await File.isDir(src)) throw new Error(`Unexpected directory ${JSON.stringify(src)} in snapshot`)
      const tgt = PathUtils.join(target, PathUtils.filename(src))
      await protect(tgt, src)
      await IOUtils.copy(src, tgt)
    }
  }

  return true
}

class WorkerZoteroCreatorTypes {
  public getTypesForItemType(itemTypeID: string): { name: string } {
    return itemCreators[client.slug][itemTypeID]?.map(name => ({ name })) || []
  }

  public isValidForItemType(creatorTypeID, itemTypeID) {
    return itemCreators[client.slug][itemTypeID]?.includes(creatorTypeID)
  }

  public getLocalizedString(type: string): string {
    return schema.locales[Zotero.locale]?.types[type] || type[0].toUpperCase() + type.substr(1).replace(/([A-Z])([a-z])/g, (m, u, l) => `${ u.toLowerCase() } ${ l }`)
  }

  public getPrimaryIDForType(typeID) {
    return itemCreators[client.slug][typeID]?.[0]
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
  public version: string = client.version

  public running?: Running

  public Utilities = WorkerZoteroUtilities
  public BetterBibTeX = new WorkerZoteroBetterBibTeX
  public CreatorTypes = new WorkerZoteroCreatorTypes
  public ItemTypes = new WorkerZoteroItemTypes
  public ItemFields = new WorkerZoteroItemFields
  public Date = ZD
  public Schema: any

  public async start() {
    this.Date.init(dateFormats)

    TranslationWorker.job.preferences.platform = client.platform
    TranslationWorker.job.preferences.client = client.slug
    this.output = ''

    this.running = await Cache.initExport(
      TranslationWorker.job.data.items,
      TranslationWorker.job.translator,
      TranslationWorker.job.autoExport || Context.make(TranslationWorker.job.translator, TranslationWorker.job.options)
    )

    if (TranslationWorker.job.options.exportFileData) {
      for (const item of this.running.serialized) {
        this.patchAttachments(item)
      }
    }

    if (TranslationWorker.job.output) {
      if (TranslationWorker.job.options.exportFileData) { // output path is a directory
        this.exportDirectory = TranslationWorker.job.output
        this.exportFile = PathUtils.join(this.exportDirectory, `${Path.basename(this.exportDirectory)}.${ZOTERO_TRANSLATOR_INFO.target}`)
      }
      else {
        this.exportFile = TranslationWorker.job.output
        const ext = `.${ ZOTERO_TRANSLATOR_INFO.target }`
        if (!this.exportFile.endsWith(ext)) this.exportFile += ext
        this.exportDirectory = PathUtils.parent(this.exportFile)
      }
      await makeDirs(this.exportDirectory)
    }
    else {
      this.exportFile = ''
      this.exportDirectory = ''
    }

    doExport()

    if (this.exportFile) await IOUtils.writeUTF8(this.exportFile, this.output)
  }

  public send(message: Message) {
    ctx.postMessage(message)
  }

  public get locale() {
    return client.locale
  }

  public getHiddenPref(pref) {
    return TranslationWorker.job.preferences[pref.replace(/^better-bibtex\./, '')]
  }

  public getOption(option) {
    return TranslationWorker.job.options[option]
  }

  public debug(message) {
    if (TranslationWorker.job.debugEnabled) this.send({ kind: 'debug', message })
  }

  public logError(err: Error | string) {
    let message: string = typeof err === 'string' ? err : `${ err.message }\n${ err.stack }`.trim()
    message = `error: ${ message }`
    this.send({ kind: 'debug', message })
  }

  public write(str) {
    this.output += str
  }

  public nextItem() {
    this.send({ kind: 'item', item: this.running.serialized.length - TranslationWorker.job.data.items.length })
    return this.running.serialized.shift()
  }

  public nextCollection(): Collection {
    return TranslationWorker.job.data.collections.shift()
  }

  private patchAttachments(item): void {
    if (item.itemType === 'attachment') {
      item.saveFile = saveFile.bind(item)

      if (!item.defaultPath && item.localPath) { // why is this not set by itemGetter?!
        item.defaultPath = `files/${item.itemID}/${Path.basename(item.localPath)}`
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
export var Zotero = new WorkerZotero // eslint-disable-line no-var

class WorkerServer extends WorkerServerBase implements Exporter {
  async initialize(config: { CSL_MAPPINGS: any; dateFormatsJSON: any }): Promise<void> { // eslint-disable-line @typescript-eslint/require-await
    Zotero.Schema = { ...config.CSL_MAPPINGS }
    ZD.init(config.dateFormatsJSON)
  }

  async start(job: Job): Promise<{ output: string; cacheRate: number }> {
    TranslationWorker.job = job

    importScripts(`chrome://zotero-better-bibtex/content/resource/${ TranslationWorker.job.translator }.js`)
    try {
      if (!Cache.opened) await Cache.open()
      await Zotero.start()
      const cacheRate = Zotero.running.hits + Zotero.running.misses ? Zotero.running.hits / (Zotero.running.hits + Zotero.running.misses) : 0
      return { output: Zotero.output, cacheRate }
    }
    finally {
      await Zotero.running?.flush()
      Zotero.running = null
    }
  }

  async terminate(): Promise<void> { // eslint-disable-line @typescript-eslint/require-await
    if (Cache.opened) Cache.close()
  }
}
new WorkerServer
