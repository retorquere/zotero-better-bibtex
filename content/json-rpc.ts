/* eslint-disable @typescript-eslint/require-await, no-throw-literal, max-len */

import { getItemsAsync } from './get-items-async'
import { AUXScanner } from './aux-scanner'
import { AutoExport } from './auto-export'
import { Translators } from './translators'
import { get as getCollection } from './collection'
import * as Library from './library'
import { log } from './logger'

import methods from '../gen/api/json-rpc.json'
import { validator, noncoercing } from './ajv'

for (const meta of Object.values(methods)) {
  (meta as unknown as any).validate = validator(meta.schema, noncoercing) // eslint-disable-line @typescript-eslint/no-unsafe-return
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

    const ae = await AutoExport.get(path)
    if (ae && ae.translatorID === translatorID && ae.type === 'collection' && ae.id === coll.id) {
      await AutoExport.schedule(ae.type, [ae.id])
    }
    else if (ae && !replace) {
      throw { code: INVALID_PARAMETERS, message: "Auto-export exists with incompatible parameters, but no 'replace' was requested" }
    }
    else {
      await AutoExport.add({
        enabled: true,
        type: 'collection',
        id: coll.id,
        path,
        status: 'done',
        recursive: false,
        updated: Date.now(),
        error: '',
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
   * Search for items in Zotero.
   *
   * Examples
   *
   * - search('') or search([]): return every entries
   * - search('Zotero'): quick search for 'Zotero'
   * - search([['title', 'contains', 'Zotero']]): search for 'Zotero' in the Title
   * - search([['library', 'is', 'My Library']]): search for entries in 'My Library'
   *   (this function try to resolve the string 'My Library' into is own libraryId number)
   * - search([['ignore_feeds']]): custom action for ignoring the feeds
   * - search([['ignore_feeds'], ['quicksearch-titleCreatorYear', 'contains', 'Zotero']]): quick search for 'Zotero' ignoring the Feeds
   * - search([['creator', 'contains', 'Johnny'], ['title', 'contains', 'Zotero']]): search for entries with Creator 'Johnny' AND Title 'Zotero'
   * - search([['blockStart'], ['creator', 'contains', 'Johnny'], ['title', 'contains', 'Zotero'], ['blockEnd']]): search for entries with Creator 'Johnny' OR Title 'Zotero'
   *
   * @param terms  Single string as typed into the search box in Zotero (search for Title Creator Year)
   *               Array of tuples similar as typed into the advanced search box in Zotero
   *               (https://github.com/zotero/zotero/blob/9971f15e617f19f1bc72f8b24bb00b72d2a4736f/chrome/content/zotero/xpcom/data/searchConditions.js#L72-L610)
   */
  public async search(terms: string
  | ([string] | [string, string] | [string, string, string | number] | [string, string, string | number, boolean])[]) {

    const search = new Zotero.Search()

    if (!terms.length) {/* */}
    else if (typeof terms === 'string') {
      search.addCondition('quicksearch-titleCreatorYear', 'contains', terms)
    }
    else {
      blk: for (const term of terms) {
        // Custom Actions
        if ((term.length === 1)) {
          switch (term[0]) {
            case 'ignore_feeds': {
              for (const feed of Zotero.Feeds.getAll()) {
                search.addCondition('libraryID', 'isNot', feed.libraryID)
              }
              continue blk
            }
          }
        }
        // libraryId can be provided as Library Name
        else if ((term.length >= 3) && (term[0] === 'libraryID')) {
          try {
            term[2] = Library.get(term[2]).libraryID
          }
          catch (err) {
            throw new Error(`library ${JSON.stringify(term[2])} not found`)
          }
        }
        search.addCondition(...term)
      }
    }

    const ids = new Set(await search.search() as number[])

    const items = await getItemsAsync(Array.from(ids))
    const libraries = {}

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return items.map(item => {
      libraries[item.libraryID] = libraries[item.libraryID] || Zotero.Libraries.get(item.libraryID).name

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        ...Zotero.Utilities.Item.itemToCSLJSON(item),
        library: libraries[item.libraryID],
        citekey: Zotero.BetterBibTeX.KeyManager.get(item.id).citationKey,
      }
    })
  }

  /**
   * List attachments for an item with the given citekey
   *
   * @param citekey  The citekey to search for
   */
  public async attachments(citekey: string) {
    const key = Zotero.BetterBibTeX.KeyManager.first({ where: { citationKey: citekey.replace(/^@/, '') } })
    if (!key) throw { code: INVALID_PARAMETERS, message: `${citekey} not found` }
    const item = await getItemsAsync(key.itemID)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (await getItemsAsync(item.getAttachments())).map(att => {
      const data: Record<string, any> = {
        open: `zotero://open-pdf/${Zotero.API.getLibraryPrefix(item.libraryID || Zotero.Libraries.userLibraryID)}/items/${att.key}`,
        path: att.getFilePath(),
      }

      if (att.isPDFAttachment()) {
        data.annotations = att.getAnnotations().map(raw => {
          const annot = raw.toJSON()

          if (annot.annotationType === 'image') {
            annot.annotationImagePath = Zotero.Annotations.getCacheImagePath(item)
          }

          if (annot.annotationPosition && typeof annot.annotationPosition === 'string') {
            annot.annotationPosition = JSON.parse(annot.annotationPosition)
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return annot
        })
      }

      return data
    })
  }

  /**
   * Fetch the collections containing a range of citekeys
   *
   * @param citekeys An array of citekeys
   * @param includeParents Include all parent collections back to the library root
   */
  public async collections(citekeys: string[], includeParents?: boolean) {
    const keys = Zotero.BetterBibTeX.KeyManager.find({ where: { citationKey: { in: citekeys.map(citekey => citekey.replace('@', '')) } } })
    if (!keys.length) throw { code: INVALID_PARAMETERS, message: `zero matches for ${citekeys.join(',')}` }

    const seen = {}
    const recurseParents = (libraryID: string, key: string) => {
      if (!seen[key]) {
        let col = Zotero.Collections.getByLibraryAndKey(libraryID, key)

        if (!col) return false

        col = col.toJSON()

        if (col.parentCollection) {
          col.parentCollection = recurseParents(libraryID, col.parentCollection)
        }

        delete col.relations
        delete col.version

        seen[key] = col
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return seen[key]
    }

    const collections = {}
    for (const key of keys) {
      const item = await getItemsAsync(key.itemID)
      collections[key.citationKey] = item.getCollections().map(id => {
        const col = Zotero.Collections.get(id).toJSON()

        delete col.relations
        delete col.version

        seen[id] = col

        if (includeParents && col.parentCollection) {
          col.parentCollection = recurseParents(item.libraryID, col.parentCollection)
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return col
      })
    }

    return collections
  }

  /**
   * Fetch the notes for a range of citekeys
   *
   * @param citekeys An array of citekeys
   */
  public async notes(citekeys: string[]) {
    const keys = Zotero.BetterBibTeX.KeyManager.find({ where: { citationKey: { in: citekeys.map(citekey => citekey.replace('@', '')) } } })
    if (!keys.length) throw { code: INVALID_PARAMETERS, message: `zero matches for ${citekeys.join(',')}` }

    const notes = {}
    for (const key of keys) {
      const item = await getItemsAsync(key.itemID)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      notes[key.citationKey] = (await getItemsAsync(item.getNotes())).map(note => note.getNote())
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
  public async bibliography(citekeys: string[], format: { quickCopy?: boolean, contentType?: 'html' | 'text', locale?: string, id?: string} = {}, library?: string | number) {
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

    const where = {
      citationKey: { in: citekeys.map((citekey: string) => citekey.replace('@', '')) },
      libraryID: Library.get(library).libraryID,
    }
    if (library === '*') delete where.libraryID

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const items = await getItemsAsync(Zotero.BetterBibTeX.KeyManager.find({ where }).map(key => key.itemID))

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

      keys[key] = Zotero.BetterBibTeX.KeyManager.first({ where: { libraryID, itemKey } })?.citationKey || null
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
  public async export(citekeys: string[], translator: string, libraryID?: string | number) {
    const where = {
      citationKey: { in: citekeys },
      libraryID: Library.get(libraryID).libraryID,
    }

    const found = Zotero.BetterBibTeX.KeyManager.find({ where })

    const status: Record<string, number> = {}
    for (const citekey of citekeys) {
      status[citekey] = 0
    }
    for (const item of found) {
      status[item.citationKey] += 1
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
    return [OK, 'text/plain', await Translators.exportItems({
      translatorID: Translators.getTranslatorId(translator),
      displayOptions: {},
      scope: { type: 'items', items: await getItemsAsync(found.map(key => key.itemID)) }, // eslint-disable-line @typescript-eslint/no-unsafe-return
    })]
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
          return {
            jsonrpc: '2.0',
            error: {
              code: INVALID_PARAMETERS,
              message: `${request.method}: expected (max) ${schema.parameters.length} arguments, got ${request.params.length}`,
            },
            id: null,
          }
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
