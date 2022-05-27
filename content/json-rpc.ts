/* eslint-disable @typescript-eslint/require-await, no-throw-literal, max-len */

import { getItemsAsync } from './get-items-async'
import { AUXScanner } from './aux-scanner'
import { AutoExport } from './auto-export'
import { Translators } from './translators'
import { Preference } from './prefs'
import { get as getCollection } from './collection'
import { $and, Query } from './db/loki'
import * as Library from './library'
import { log } from './logger'

import methods from '../gen/api/json-rpc.json'
import { validator } from './ajv'

for (const meta of Object.values(methods)) {
  (meta as unknown as any).validate = validator(meta.schema) // eslint-disable-line @typescript-eslint/no-unsafe-return
}

const OK = 200

const PARSE_ERROR = -32700 // Invalid JSON was received by the server.
const INVALID_REQUEST = -32600 // The JSON sent is not a valid Request object.
const METHOD_NOT_FOUND = -32601 // The method does not exist / is not available.
const INVALID_PARAMETERS = -32602 // Invalid method parameter(s).
const INTERNAL_ERROR = -32603 // Internal JSON-RPC error.

class NSCollection {
  /**
   * Scan an AUX file for citekeys and populate a Zotero collection from them. The target collection will be cleared if it exists.
   *
   * @param collection  The forward-slash separated path to the collection. The first part of the path must be the library name, or empty (`//`); empty is your personal library. Intermediate collections that do not exist will be created as needed.
   * @param aux         The absolute path to the AUX file on disk
   *
   */
  public async scanAUX(collection: string, aux: string) {
    const { libraryID, key } = await getCollection(collection, true)
    await AUXScanner.scan(aux, { collection: { libraryID, key, replace: true } })
    return { libraryID, key }
  }
}

class NSAutoExport {
  /**
   * Add an auto-export for the given collection. The target collection will be created if it does not exist
   *
   * @param collection                             The forward-slash separated path to the collection. The first part of the path must be the library name, or empty (`//`); empty is your personal library. Intermediate collections that do not exist will be created as needed.
   * @param translator                             The name or GUID of a BBT translator
   * @param path                                   The absolute path to which the collection will be auto-exported
   * @param displayOptions                         Options which you would be able to select during an interactive export; `exportNotes`, default `false`, and `useJournalAbbreviation`, default `false`
   * @param replace                                Replace the auto-export if it exists, default `false`
   * @returns                                      Collection ID of the target collection
   */
  public async add(collection: string, translator: string, path: string, displayOptions:Record<string, boolean> = {}, replace = false): Promise<{ libraryID: number, key: string, id: number}> {
    const translatorID = Translators.getTranslatorId(translator)
    if (!Translators.byId[translatorID]) throw { code: INVALID_PARAMETERS, message: `Unknown translator '${translator}'` }

    const coll = await getCollection(collection, true)

    const ae = AutoExport.db.findOne($and({ path }))
    if (ae && ae.translatorID === translatorID && ae.type === 'collection' && ae.id === coll.id) {
      AutoExport.schedule(ae.type, [ae.id])

    }
    else if (ae && !replace) {
      throw { code: INVALID_PARAMETERS, message: "Auto-export exists with incompatible parameters, but no 'replace' was requested" }

    }
    else {
      AutoExport.add({
        type: 'collection',
        id: coll.id,
        path,
        status: 'done',
        translatorID,
        exportNotes: displayOptions.exportNotes,
        useJournalAbbreviation: displayOptions.useJournalAbbreviation,
      }, true)
    }

    return { libraryID: coll.libraryID, key: coll.key, id: coll.id }
  }
}

class NSUser {
  /**
   * List the libraries (also known as groups) the user has in Zotero
   *
   * @param includeCollections Wether or not the result should inlcude a list of collection for each library (default is false)
   */
  public async groups(includeCollections?: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await Zotero.Libraries
      .getAll().map(lib => ({
        id: lib.libraryID,
        name: lib.name,
        collections: includeCollections ? Zotero.Collections.getByLibrary(lib.libraryID, true) : undefined,
      }))
  }
}

class NSItem {
  /**
   * Quick-search for items in Zotero.
   *
   * @param terms  Terms as typed into the search box in Zotero
   */
  public async search(terms: string, library?: string | number) {
    // quicksearch-titleCreatorYear / quicksearch-fields
    // const mode = Prefs.get('caywAPIsearchMode')

    terms = terms.replace(/ (?:&|and) /g, ' ')
    if (!/[\w\u007F-\uFFFF]/.test(terms)) return []

    const search = new Zotero.Search()
    for (const feed of Zotero.Feeds.getAll()) {
      search.addCondition('libraryID', 'isNot', feed.libraryID)
    }
    search.addCondition('quicksearch-titleCreatorYear', 'contains', terms)
    search.addCondition('itemType', 'isNot', 'attachment')
    if (typeof library !== 'undefined') {
      try {
        search.addCondition('libraryID', 'is', Library.get(library).id)
      }
      catch (err) {
        throw new Error(`library ${JSON.stringify(library)} not found`)
      }
    }

    const ids: Set<number> = new Set(await search.search())

    // add partial-citekey search results.
    for (const partialCitekey of terms.split(/\s+/)) {
      for (const item of Zotero.BetterBibTeX.KeyManager.keys.find({ citekey: { $contains: partialCitekey } })) {
        ids.add(item.itemID)
      }
    }

    const items = await getItemsAsync(Array.from(ids))
    const libraries = {}

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return items.map(item => {
      libraries[item.libraryID] = libraries[item.libraryID] || Zotero.Libraries.get(item.libraryID).name

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        ...Zotero.Utilities.itemToCSLJSON(item),
        library: libraries[item.libraryID],
        citekey: Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ libraryID: item.libraryID, itemID: item.id })).citekey,
      }
    })
  }

  /**
   * List attachments for an item with the given citekey
   *
   * @param citekey  The citekey to search for
   */
  public async attachments(citekey: string) {
    const key = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ citekey: citekey.replace(/^@/, '') }))
    if (!key) throw { code: INVALID_PARAMETERS, message: `${citekey} not found` }
    const item = await getItemsAsync(key.itemID)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (await getItemsAsync(item.getAttachments())).map(att => ({
      open: `zotero://open-pdf/${Zotero.API.getLibraryPrefix(item.libraryID || Zotero.Libraries.userLibraryID)}/items/${att.key}`,
      path: att.getFilePath(),
      annotations: att.getAnnotations().map(raw => {
        const annot = raw.toJSON()

        if (annot.annotationPosition && typeof annot.annotationPosition === 'string') {
          annot.annotationPosition = JSON.parse(annot.annotationPosition)
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return annot
      }),
    }))
  }

  /**
   * Fetch the notes for a range of citekeys
   *
   * @param citekeys An array of citekeys
   */
  public async notes(citekeys: string[]) {
    const keys = Zotero.BetterBibTeX.KeyManager.keys.find({ citekey: { $in: citekeys.map(citekey => citekey.replace('@', '')) } })
    if (!keys.length) throw { code: INVALID_PARAMETERS, message: `zero matches for ${citekeys.join(',')}` }

    const notes = {}
    for (const key of keys) {
      const item = await getItemsAsync(key.itemID)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      notes[key.citekey] = (await getItemsAsync(item.getNotes())).map(note => note.getNote())
    }
    return notes
  }

  /**
   * Generate a bibliography for the given citekeys
   *
   * @param citekeys An array of citekeys
   * @param format   A specification of how the bibliography should be formatted
   * @param.quickCopy    Format as specified in the Zotero quick-copy settings
   * @param.contentType  Output as HTML or text
   * @param.locale       Locale to use to generate the bibliography
   * @param.id           CSL style to use
   *
   * @returns  A formatted bibliography
   */
  public async bibliography(citekeys: string[], format: { quickCopy?: boolean, contentType?: 'html' | 'text', locale?: string, id?: string} = {}) {
    const qc = format.quickCopy ? Zotero.QuickCopy.unserializeSetting(Zotero.Prefs.get('export.quickCopy.setting')) : {}
    delete format.quickCopy

    format = {
      contentType: 'text', // can be 'html'
      locale: '',
      id: '',
      ...qc,
      ...format,
    }

    if (!format.id) throw new Error('no style specified')
    if (!format.id.includes('/')) format.id = `http://www.zotero.org/styles/${format.id}`

    if (((format as any).mode || 'bibliography') !== 'bibliography') throw new Error(`mode must be bibliograpy, not ${(format as any).mode}`)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const items = await getItemsAsync(Zotero.BetterBibTeX.KeyManager.keys.find({ citekey: { $in: citekeys.map((citekey: string) => citekey.replace('@', '')) } }).map(key => key.itemID))

    const bibliography = Zotero.QuickCopy.getContentFromItems(items, { ...format, mode: 'bibliography' }, null, false)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return bibliography[format.contentType || 'html']
  }

  /**
   * Fetch citationkeys given item keys
   *
   * @param item_keys  A list of [libraryID]:[itemKey] strings. If [libraryID] is omitted, assume 'My Library'
   */
  public async citationkey(item_keys: string[]) {
    const keys = {}

    let libraryIDstr: string
    let libraryID: number
    let itemKey: string

    for (const key of item_keys) {
      if (key.includes(':')) {
        [ libraryIDstr, itemKey ] = key.split(':')
        libraryID = parseInt(libraryIDstr)
        if (isNaN(libraryID)) throw new Error(`Could not parse library ID from ${key}`)
      }
      else {
        libraryID = Zotero.Libraries.userLibraryID
        itemKey = key
      }

      keys[key] = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ libraryID, itemKey }))?.citekey || null
    }

    return keys
  }

  /**
   * Generate an export for a list of citekeys
   *
   * @param citekeys   Array of citekeys
   * @param translator BBT translator name or GUID
   * @param libraryID  ID of library to select the items from. When omitted, assume 'My Library'
   */
  public async export(citekeys: string[], translator: string, libraryID?: number) {
    const query: Query = {$and: [{citekey: { $in: citekeys } } ]}

    if (Preference.keyScope === 'library') {
      if (typeof libraryID === 'undefined') libraryID = Zotero.Libraries.userLibraryID
      if (typeof libraryID !== 'number') throw { code: INVALID_PARAMETERS, message: 'keyscope is library, please provide a library ID' }
      query.$and.push({ libraryID: {$eq: libraryID} })
    }
    else if (Preference.keyScope === 'global') {
      if (typeof libraryID === 'number') throw { code: INVALID_PARAMETERS, message: 'keyscope is global, do not provide a library ID' }
    }

    const found = Zotero.BetterBibTeX.KeyManager.keys.find(query)

    const status: Record<string, number> = {}
    for (const citekey of citekeys) {
      status[citekey] = 0
    }
    for (const item of found) {
      status[item.citekey] += 1
    }
    const error = { missing: [], duplicates: [] }
    for (const [citekey, n] of Object.entries(status)) {
      switch (n) {
        case 0:
          error.missing.push(citekey)
          break
        case 1:
          break
        default:
          error.duplicates.push(citekey)
          break
      }
    }

    if (error.missing.length || error.duplicates.length) {
      const message = [
        error.missing.length ? `not found: ${error.missing.join(', ')}` : '',
        error.duplicates.length ? `duplicates found: ${error.duplicates.join(', ')}` : '',
      ].filter(msg => msg).join('\n')
      throw { code: INVALID_PARAMETERS, message }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return [OK, 'text/plain', await Translators.exportItems(Translators.getTranslatorId(translator), null, { type: 'items', items: await getItemsAsync(found.map(key => key.itemID)) }) ]
  }
}

const api = new class API {
  public $user = new NSUser
  public $item = new NSItem
  public $items: NSItem
  public $collection = new NSCollection
  public $autoexport = new NSAutoExport

  constructor() {
    this.$items = this.$item
  }

  public async handle(request) {
    if (!this.validRequest(request)) return {jsonrpc: '2.0', error: {code: INVALID_REQUEST, message: 'Invalid Request'}, id: null}

    const [ namespace, methodName ] = request.method.split('.')
    const method = this[`$${namespace}`]?.[methodName]
    if (!method) return {jsonrpc: '2.0', error: {code: METHOD_NOT_FOUND, message: `Method not found: ${request.method}`}, id: null}
    const schema = methods[request.method]
    if (!schema) return {jsonrpc: '2.0', error: {code: METHOD_NOT_FOUND, message: `Method schema not found: ${request.method}`}, id: null}

    const args: { array: any[], object: any } = {
      array: [],
      object: {},
    }
    if (request.params) {
      if (Array.isArray(request.params)) {
        if (request.params.length > schema.parameters.length) {
          return {jsonrpc: '2.0', error: {code: INVALID_PARAMETERS, message: `${request.method}: expected (max) ${schema.parameters.length} arguments, got ${request.params.length}`}, id: null}
        }

        args.array = request.params
        args.object = schema.parameters.reduce((acc, p, i) => {
          acc[p] = request.params[i]
          return acc // eslint-disable-line @typescript-eslint/no-unsafe-return
        }, {})
      }
      else if (typeof request.params === 'object') {
        const unknown = Object.keys(request.params).find(p => !schema.parameters.includes(p))
        if (unknown) {
          return {jsonrpc: '2.0', error: {code: INVALID_PARAMETERS, message: `${request.method}: unexpected argument ${unknown}`}, id: null}
        }

        args.array = schema.parameters.map(p => request.params[p]) // eslint-disable-line @typescript-eslint/no-unsafe-return
        args.object = request.params
      }
      else {
        return {jsonrpc: '2.0', error: {code: INVALID_PARAMETERS, message: 'Invalid Parameters'}, id: null}
      }
    }

    const argerror = schema.validate(args.object)
    if (argerror) return {jsonrpc: '2.0', error: {code: INVALID_PARAMETERS, message: argerror}, id: null}

    try {
      return {jsonrpc: '2.0', result: await method(...args.array), id: request.id || null}
    }
    catch (err) {
      log.error('JSON-RPC:', err)
      if (err.code) {
        return {jsonrpc: '2.0', error: { code: err.code, message: err.message }, id: null}
      }
      else {
        return {jsonrpc: '2.0', error: { code: INTERNAL_ERROR, message: `${err}` }, id: null}
      }
    }
  }

  private validRequest(req) {
    if (typeof req !== 'object') return false
    if (req.jsonrpc !== '2.0') return false
    if (typeof req.method !== 'string') return false
    return true
  }
}

Zotero.Server.Endpoints['/better-bibtex/json-rpc'] = class {
  public supportedMethods = ['POST']
  public supportedDataTypes = 'application/json'
  public permitBookmarklet = false

  public async init({ data }) {
    await Zotero.BetterBibTeX.ready

    try {
      const response = await (Array.isArray(data) ? Promise.all(data.map(req => api.handle(req))) : api.handle(data))
      return [OK, 'application/json', JSON.stringify(response)]
    }
    catch (err) {
      return [OK, 'application/json', JSON.stringify({jsonrpc: '2.0', error: {code: PARSE_ERROR, message: `Parse error: ${err} in ${data}`}, id: null})]
    }
  }
}
