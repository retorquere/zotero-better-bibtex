/* eslint-disable @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */

import type { Attachment, Item, Note } from '../../gen/typings/serialized-item'
type Serialized = Attachment | Item | Note

import { ExportedItemMetadata, Cache, exportContext } from '../db/cache'

import flatMap from 'array.prototype.flatmap'
flatMap.shim()
import matchAll from 'string.prototype.matchall'
matchAll.shim()

declare const IOUtils: any

import { Shim } from '../os'
import * as client from '../client'
if (!client.is7) importScripts('resource://gre/modules/osfile.jsm')
const $OS = client.is7 ? Shim : OS

const ctx: DedicatedWorkerGlobalScope = self as any

importScripts('resource://zotero/config.js') // import ZOTERO_CONFIG'

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
    return children[prop]
  },

  set(target, prop, _value) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
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

      const fragment = domParser.parseFromString(`<span>${ text }</span>`, 'text/html').documentElement

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
const schema = client.slug === 'zotero' ? zotero_schema : jurism_schema
import dateFormats from '../../schema/dateFormats.json'

export const TranslationWorker: { job?: Partial<Translators.Worker.Job> } = {}

class WorkerZoteroBetterBibTeX {
  public clientName = client.clientName
  public client = client.slug
  public worker = true

  public Cache = {
    store(itemID: number, entry: string, metadata: ExportedItemMetadata) {
      Cache.export.store({ itemID, entry, metadata })
    },
    fetch(itemID: number) {
      return Cache.export.fetch(itemID)
    },
  }

  public setProgress(percent: number) {
    Zotero.send({ kind: 'progress', percent, translator: TranslationWorker.job.translator, autoExport: TranslationWorker.job.autoExport })
  }

  public getContents(path: string): string {
    if (!path) return null

    try {
      if (client.is7) {
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
      else {
        if (!OS.File.exists(path)) return null
        const bytes = <ArrayBuffer>OS.File.read(path)
        const decoder = (new TextDecoder)
        return decoder.decode(bytes as BufferSource)
      }
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

  getVersion: () => client.ZoteroVersion,
}

function isWinRoot(path) {
  return client.isWin && path.match(/^[a-z]:\\?$/i)
}
async function makeDirs(path) {
  if (isWinRoot(path)) return
  if (!$OS.Path.split(path).absolute) throw new Error(`Will not create relative ${ path }`)

  path = $OS.Path.normalize(path)

  const paths: string[] = []
  // path === paths[0] means we've hit the root, as the dirname of root is root
  while (path !== paths[0] && !isWinRoot(path) && !(await $OS.File.exists(path))) {
    paths.unshift(path)
    path = $OS.Path.dirname(path)
  }

  if (!isWinRoot(path) && !(await $OS.File.stat(path)).isDir) throw new Error(`makeDirs: root ${ path } is not a directory`)

  for (path of paths) {
    await $OS.File.makeDir(path) as void
  }
}

async function saveFile(path, overwrite) {
  if (!Zotero.exportDirectory) return false

  if (!await $OS.File.exists(this.localPath)) return false

  this.path = $OS.Path.normalize($OS.Path.join(Zotero.exportDirectory, path))
  if (!this.path.startsWith(Zotero.exportDirectory)) throw new Error(`${ path } looks like a relative path`)

  if (this.linkMode === 'imported_file' || (this.linkMode === 'imported_url' && this.contentType !== 'text/html')) {
    await makeDirs($OS.Path.dirname(this.path))
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    await $OS.File.copy(this.localPath, this.path, { noOverwrite: !overwrite })
  }
  else if (this.linkMode === 'imported_url') {
    const target = $OS.Path.dirname(this.path)
    if (!overwrite && (await $OS.File.exists(target))) throw new Error(`${ path } would overwite ${ target }`)

    await $OS.File.removeDir(target, { ignoreAbsent: true })
    await makeDirs(target)

    const snapshot = $OS.Path.dirname(this.localPath)
    const iterator = new $OS.File.DirectoryIterator(snapshot)
    const files: { src: string; tgt: string }[] = []
    await iterator.forEach(entry => { // eslint-disable-line @typescript-eslint/no-floating-promises
      if (entry.isDir) throw new Error(`Unexpected directory ${ entry.path } in snapshot`)
      if (entry.name !== '.zotero-ft-cache') {
        files.push({
          src: $OS.Path.join(snapshot, entry.name),
          tgt: $OS.Path.join(target, entry.name),
        })
      }
    })
    iterator.close()
    for (const file of files) {
      await $OS.File.copy(file.src, file.tgt, { noOverwrite: !overwrite })
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
  private items: Serialized[]

  public Utilities = WorkerZoteroUtilities
  public BetterBibTeX = new WorkerZoteroBetterBibTeX // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
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

    // trace('cache: load serialized')
    this.items = await Cache.ZoteroSerialized.get(TranslationWorker.job.data.items)
    // trace('cache: serialized loaded')

    if (TranslationWorker.job.options.exportFileData) {
      for (const item of this.items) {
        this.patchAttachments(item)
      }
    }

    if (TranslationWorker.job.output) {
      if (TranslationWorker.job.options.exportFileData) { // output path is a directory
        this.exportDirectory = $OS.Path.normalize(TranslationWorker.job.output)
        this.exportFile = $OS.Path.join(this.exportDirectory, `${ $OS.Path.basename(this.exportDirectory) }.${ ZOTERO_TRANSLATOR_INFO.target }`)
      }
      else {
        this.exportFile = $OS.Path.normalize(TranslationWorker.job.output)
        const ext = `.${ ZOTERO_TRANSLATOR_INFO.target }`
        if (!this.exportFile.endsWith(ext)) this.exportFile += ext
        this.exportDirectory = $OS.Path.dirname(this.exportFile)
      }
      await makeDirs(this.exportDirectory)
    }
    else {
      this.exportFile = ''
      this.exportDirectory = ''
    }

    doExport()

    if (this.exportFile) {
      const encoder = (new TextEncoder)
      const array = encoder.encode(this.output)
      await $OS.File.writeAtomic(this.exportFile, array) as void
    }
  }

  public send(message: Translators.Worker.Message) {
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
    this.send({ kind: 'item', item: this.items.length - TranslationWorker.job.data.items.length })
    return this.items.shift()
  }

  public nextCollection(): Collection {
    return TranslationWorker.job.data.collections.shift()
  }

  private patchAttachments(item): void {
    if (item.itemType === 'attachment') {
      item.saveFile = saveFile.bind(item)

      if (!item.defaultPath && item.localPath) { // why is this not set by itemGetter?!
        item.defaultPath = `files/${ item.itemID }/${ $OS.Path.basename(item.localPath) }`
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

ctx.onmessage = async function(e: { isTrusted?: boolean; data?: Translators.Worker.Message }): Promise<void> { // eslint-disable-line prefer-arrow/prefer-arrow-functions
  if (!e.data) return // some kind of startup message

  // trace(`worker: ${e.data.kind}`)
  try {
    switch (e.data.kind) {
      case 'initialize':
        Zotero.Schema = { ...e.data.CSL_MAPPINGS }
        break

      case 'start':
        // trace('worker: starting')
        TranslationWorker.job = e.data.config

        importScripts(`chrome://zotero-better-bibtex/content/resource/${ TranslationWorker.job.translator }.js`)
        // trace('worker: loaded')
        try {
          if (!Cache.opened) await Cache.open()
          // trace('worker: cache opened')
          await Cache.initExport(TranslationWorker.job.translator, TranslationWorker.job.autoExport || exportContext(TranslationWorker.job.translator, TranslationWorker.job.options))
          // trace('worker: cache loaded')
          await Zotero.start()
          // trace('worker: export done')
          Zotero.send({ kind: 'done', output: Zotero.output })
        }
        catch (err) {
          Zotero.send({ kind: 'error', message: `${ err }\n${ err.stack }` })
        }
        finally {
          await Cache.export.flush()
        }
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
    log.error(err)
  }
}
