declare const Zotero: any

import debug = require('./debug.ts')
// import Prefs = require('./prefs.ts')
import KeyManager = require('./keymanager.ts')
import getItemsAsync = require('./get-items-async.ts')

const OK = 200

const PARSE_ERROR = -32700 // Invalid JSON was received by the server.
const INVALID_REQUEST = -32600 // The JSON sent is not a valid Request object.
const METHOD_NOT_FOUND = -32601 // The method does not exist / is not available.
const INVALID_PARAMETERS = -32602 // Invalid method parameter(s).
const INTERNAL_ERROR = -32603 // Internal JSON-RPC error.

const $user = new class User {
  public async groups() {
    return Zotero.Libraries.getAll().map(lib => ({ id: lib.libraryID, name: lib.name }))
  }
}

const $item = new class Item {
  public async search(terms) {
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

    /*
    const format = Zotero.Prefs.get('export.quickCopy.setting')

    debug('formatted-citations:', format, Zotero.QuickCopy.unserializeSetting(format))
    if (Zotero.QuickCopy.unserializeSetting(format).mode !== 'bibliography') throw new Error('formatted-citations requires the Zotero default quick-copy format to be set to a citation style')
    */

    // add citekey search
    for (const item of KeyManager.keys.find({ citekey: { $contains: terms } })) {
      ids.add(item.itemID)
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
}

const api = new class API {
  public async handle(request, allowArray = true) {
    if (allowArray && Array.isArray(request)) {
      const response = []
      for (const subreq of request) {
        response.push(await this.handle(subreq, false))
      }
      return response
    }

    if (!this.validRequest(request)) return {jsonrpc: '2.0', error: {code: INVALID_REQUEST, message: 'Invalid Request'}, id: null}
    if (request.params && (!Array.isArray(request.params) && typeof request.params !== 'object')) return {jsonrpc: '2.0', error: {code: INVALID_PARAMETERS, message: 'Invalid Parameters'}, id: null}

    const [namespace, methodName ] = request.method.split('.')
    let method = null

    switch (namespace) {
      case 'user':
        method = $user[methodName]
        break
      case 'item':
        method = $item[methodName]
        break
    }

    if (!method) return {jsonrpc: '2.0', error: {code: METHOD_NOT_FOUND, message: `Method not found: ${request.method}`}, id: null}
    try {
      if (!request.params) return {jsonrpc: '2.0', result: await method(), id: request.id || null}
      if (Array.isArray(request.params)) return {jsonrpc: '2.0', result: await method.apply(null, request.params), id: request.id || null}
      return {jsonrpc: '2.0', result: await method.call(null, request.params), id: request.id || null}
    } catch (err) {
      debug('JSON-RPC:', err)
      return {jsonrpc: '2.0', error: {code: INTERNAL_ERROR, message: `${err}`}, id: null}
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
  public supportedDataTypes = '*'
  public permitBookmarklet = false

  public async init(options) {
    await Zotero.BetterBibTeX.ready

    if (typeof options.data === 'string') options.data = JSON.parse(options.data)
    debug('json-rpc: execute', options.data)

    try {
      return [OK, 'application/json', JSON.stringify(await api.handle(options.data))]
    } catch (err) {
      return [OK, 'application/json', JSON.stringify({jsonrpc: '2.0', error: {code: PARSE_ERROR, message: `Parse error: ${err} in ${options.data}`}, id: null})]
    }
  }
}
