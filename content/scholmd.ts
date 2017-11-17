declare const Zotero: any

import debug = require('./debug.ts')

const OK = 200

const PARSE_ERROR = -32700 // Invalid JSON was received by the server.
const INVALID_REQUEST = -32600 // The JSON sent is not a valid Request object.
const METHOD_NOT_FOUND = -32601 // The method does not exist / is not available.
const INVALID_PARAMETERS = -32602 // Invalid method parameter(s).
const INTERNAL_ERROR = -32603 // Internal JSON-RPC error.

const scholmd = new class ScholMD {
  public async $libraries() {
    return Zotero.Libraries.getAll().map(lib => ({ id: lib.libraryID, name: lib.name }))
  }

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

    const method = this[`$${request.method}`]
    if (!method) return {jsonrpc: '2.0', error: {code: METHOD_NOT_FOUND, message: 'Method not found'}, id: null}
    try {
      if (!request.params) return {jsonrpc: '2.0', result: await method(), id: request.id || null}
      if (Array.isArray(request.params)) return {jsonrpc: '2.0', result: await method.apply(null, request.params), id: request.id || null}
      return {jsonrpc: '2.0', result: await method.call(null, request.params), id: request.id || null}
    } catch (err) {
      debug('ScholMD:', err)
      return {jsonrpc: '2.0', error: {code: INTERNAL_ERROR, message: 'Internal error'}, id: null}
    }
  }

  private validRequest(req) {
    if (typeof req !== 'object') return false
    if (req.jsonrpc !== '2.0') return false
    if (typeof req.method !== 'string') return false
    return true
  }
}

Zotero.Server.Endpoints['/better-bibtex/scholmd'] = class {
  public supportedMethods = ['POST']
  public supportedDataTypes = '*'
  public permitBookmarklet = false

  public async init(options) {
    if (typeof options.data === 'string') options.data = JSON.parse(options.data)
    debug('ScholMD: execute', options.data)

    try {
      return [OK, 'application/json', JSON.stringify(await scholmd.handle(options.data))]
    } catch (err) {
      return [OK, 'application/json', JSON.stringify({jsonrpc: '2.0', error: {code: PARSE_ERROR, message: `Parse error: ${err} in ${options.data}`}, id: null})]
    }
  }
}
