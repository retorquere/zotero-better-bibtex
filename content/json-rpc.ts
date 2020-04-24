declare const Zotero: any

import * as log from './debug'
import { KeyManager } from './key-manager'
import { getItemsAsync } from './get-items-async'
import { AUXScanner } from './aux-scanner'
import { Translators } from './translators'
import { Preferences as Prefs } from './prefs'

const OK = 200

const PARSE_ERROR = -32700 // Invalid JSON was received by the server.
const INVALID_REQUEST = -32600 // The JSON sent is not a valid Request object.
const METHOD_NOT_FOUND = -32601 // The method does not exist / is not available.
const INVALID_PARAMETERS = -32602 // Invalid method parameter(s).
const INTERNAL_ERROR = -32603 // Internal JSON-RPC error.

class Collection {
  public async scanAUX(collection: {libraryID: number, key: string, replace?: boolean | string }, path:string) {
    await AUXScanner.scan(path, { collection })
  }

  public async scanAUX(collection: {libraryID: number, key: string, subcollecton?: string }, path:string) {
    await AUXScanner.scan(path, { collection })
  }
}

class User {
  public async groups() {
    return Zotero.Libraries.getAll().map(lib => ({ id: lib.libraryID, name: lib.name }))
  }
}

class Item {
  public async search(terms) {
    if (typeof terms !== 'string') terms = terms.terms

    // quicksearch-titleCreatorYear / quicksearch-fields
    // const mode = Prefs.get('caywAPIsearchMode')

    terms = terms.replace(/ (?:&|and) /g, ' ', 'g')
    if (!/[\w\u007F-\uFFFF]/.test(terms)) return []

    const search = new Zotero.Search()
    for (const feed of Zotero.Feeds.getAll()) {
      search.addCondition('libraryID', 'isNot', feed.libraryID)
    }
    search.addCondition('quicksearch-titleCreatorYear', 'contains', terms)
    search.addCondition('itemType', 'isNot', 'attachment')

    const ids = new Set(await search.search())

    // add partial-citekey search results.
    for (const partialCitekey of terms.split(/\s+/)) {
      for (const item of KeyManager.keys.find({ citekey: { $contains: partialCitekey } })) {
        ids.add(item.itemID)
      }
    }

    const items = await getItemsAsync(Array.from(ids))
    const libraries = {}

    return items.map(item => {
      libraries[item.libraryID] = libraries[item.libraryID] || Zotero.Libraries.get(item.libraryID).name

      return {
        ...Zotero.Utilities.itemToCSLJSON(item),
        library: libraries[item.libraryID],
        citekey: KeyManager.keys.findOne({ libraryID: item.libraryID, itemID: item.id }).citekey,
      }
    })
  }

  public async attachments(citekey) {
    const key = KeyManager.keys.findOne({ citekey: citekey.replace(/^@/, '') })
    if (!key) throw { code: INVALID_PARAMETERS, message: `${citekey} not found` }
    const item = await getItemsAsync(key.itemID)

    return (await getItemsAsync(item.getAttachments())).map(att => ({
      open: `zotero://open-pdf/${Zotero.API.getLibraryPrefix(item.libraryID || Zotero.Libraries.userLibraryID)}/items/${att.key}`,
      path: att.getFilePath(),
    }))
  }

  public async notes(citekeys) {
    const keys = KeyManager.keys.find({ citekey: { $in: citekeys.map(citekey => citekey.replace('@', '')) } })
    if (!keys.length) throw { code: INVALID_PARAMETERS, message: `zero matches for ${citekeys.join(',')}` }

    const notes = {}
    for (const key of keys) {
      const item = await getItemsAsync(key.itemID)
      notes[key.citekey] = (await getItemsAsync(item.getNotes())).map(note => note.getNote())
    }
    return notes
  }

  public async bibliography(citekeys, format: { quickCopy?: boolean, contentType?: 'html' | 'text', locale?: string, id?: string} = {}) {
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

    const items = await getItemsAsync(KeyManager.keys.find({ citekey: { $in: citekeys.map(citekey => citekey.replace('@', '')) } }).map(key => key.itemID))

    const bibliography = Zotero.QuickCopy.getContentFromItems(items, { ...format, mode: 'bibliography' }, null, false)
    return bibliography[format.contentType || 'html']
  }

  public async citationkey(item_keys) {
    const keys = {}

    let _libraryID: string
    let libraryID: number
    let itemKey: string

    for (const key of item_keys) {
      if (key.includes(':')) {
        [ _libraryID, itemKey ] = key.split(':')
        libraryID = parseInt(_libraryID)
        if (isNaN(libraryID)) throw new Error(`Could not parse library ID from ${key}`)
      } else {
        libraryID = Zotero.Libraries.userLibraryID
        itemKey = key
      }

      keys[key] = KeyManager.keys.findOne({ libraryID, itemKey })?.citekey || null
    }

    log.debug(KeyManager.keys.data)
    return keys
  }

  public async export(citekeys: string[], translator: string, libraryID: number = Zotero.Libraries.userLibraryID) {
    const query = { libraryID, citekey: { $in: citekeys } }

    if (Prefs.get('keyScope') === 'global') {
      if (typeof libraryID === 'number') throw { code: INVALID_PARAMETERS, message: 'keyscope is global, do not provide a library ID' }
      delete query.libraryID
    } else {
      if (typeof libraryID !== 'number') throw { code: INVALID_PARAMETERS, message: 'keyscope is per-library, you should provide a library ID' }
    }

    const found = KeyManager.keys.find(query)
    if (found.length !== citekeys.length) {
      const keysfound = found.map(key => key.citekey)
      throw { code: INVALID_PARAMETERS, message: citekeys.filter(key => !keysfound.includes(key)).join(', ') + ' not found' }
    }

    translator = translator.replace(/\s/g, '')
    const _translator = translator.toLowerCase()
    for (const [label, meta] of Object.entries(Translators.byLabel)) {
      const _label = label.toLowerCase()
      if (_label === _translator || _label.replace(/^better/, '') === _translator) translator = meta.translatorID
    }

    return [OK, 'text/plain', await Translators.exportItems(translator, null, { type: 'items', items: await getItemsAsync(found.map(key => key.itemID)) }) ]
  }
}

const api = new class API {
  public $user: User
  public $item: Item
  public $items: Item
  public $collection: Collection

  constructor() {
    this.$item = this.$items = new Item
    this.$user = new User
    this.$collection = new Collection
  }

  public async handle(request) {
    if (!this.validRequest(request)) return {jsonrpc: '2.0', error: {code: INVALID_REQUEST, message: 'Invalid Request'}, id: null}
    if (request.params && (!Array.isArray(request.params) && typeof request.params !== 'object')) return {jsonrpc: '2.0', error: {code: INVALID_PARAMETERS, message: 'Invalid Parameters'}, id: null}

    const [ namespace, methodName ] = request.method.split('.')
    const method = this[`$${namespace}`]?.[methodName]

    if (!method) return {jsonrpc: '2.0', error: {code: METHOD_NOT_FOUND, message: `Method not found: ${request.method}`}, id: null}

    try {
      if (!request.params) return {jsonrpc: '2.0', result: await method(), id: request.id || null}
      if (Array.isArray(request.params)) return {jsonrpc: '2.0', result: await method.apply(null, request.params), id: request.id || null}
      return {jsonrpc: '2.0', result: await method.call(null, request.params), id: request.id || null}
    } catch (err) {
      log.error('JSON-RPC:', err)
      if (err.code) {
        return {jsonrpc: '2.0', error: { code: err.code, message: err.message }, id: null}
      } else {
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

  public async init({ data, headers }) {
    await Zotero.BetterBibTeX.ready

    try {
      log.debug('json-rpc: execute', data)

      const response = await (Array.isArray(data) ? Promise.all(data.map(req => api.handle(req))) : api.handle(data))
      return [OK, 'application/json', JSON.stringify(response)]
    } catch (err) {
      return [OK, 'application/json', JSON.stringify({jsonrpc: '2.0', error: {code: PARSE_ERROR, message: `Parse error: ${err} in ${data}`}, id: null})]
    }
  }
}
