import { log, stringify } from '../logger'

type JsonRpcMessage = {
  jsonrpc: '2.0'
  id: string
  method: string
  params?: any[]
  result?: any
  error?: {
    code?: number
    message: string
  }
}

export class Client {
  #nextId = 0
  #handlers = {}
  #namespace: string
  #id: string

  constructor(worker: Worker, namespace = '') {
    this.#namespace = namespace
    this.#id = `[${this.#namespace}${Date.now()}:${Math.random()}]`

    worker.addEventListener('message', (e: MessageEvent<JsonRpcMessage>) => {
      const req = e.data
      if (!req || req.jsonrpc !== '2.0' || typeof req.id !== 'string') {
        log.debug(`json-rpc: main received non-json-rpc response ${stringify(req)}`)
        return
      }
      if (!req.id.startsWith(this.#id)) {
        // log.debug(`json-rpc: main ${this.#id} received neighbour json-rpc response ${req.id}`)
        return
      }
      if (!this.#handlers[req.id]) {
        log.error(`json-rpc: ERROR: main has no handler for json-rpc response ${req.id}`)
        return
      }
      log.info(`json-rpc: main received ${req.error ? 'error' : 'success'} for ${req.method || req.id}`)
      this.#handlers[req.id](req)
      delete this.#handlers[req.id]
    })

    return new Proxy(this, {
      get(target, property, receiver) {
        if (typeof property === 'string' && !(property in target)) {
          return function(...args) {
            return new Promise((resolve, reject) => {
              const message = {
                jsonrpc: '2.0',
                id: `${target.#id}${target.#nextId++}`,
                method: `${target.#namespace}${property}`,
                params: args,
              }
              target.#handlers[message.id] = response => {
                if (response.error) return reject(new Error(response.error.message))
                resolve(response.result)
              }

              worker.postMessage(message)
              log.debug(`json-rpc: main sent ${message.id} ${message.method}`)
            })
          }
        }

        return Reflect.get(target, property, receiver)
      },
    })
  }
}

const METHOD_NOT_FOUND = -32601
const INTERNAL_ERROR = -32603
export class Server {
  constructor() {
    self.addEventListener('message', async (e: MessageEvent<JsonRpcMessage>) => { // eslint-disable-line @typescript-eslint/no-misused-promises
      const req = e.data
      if (!req || req.jsonrpc !== '2.0' || !req.id) return

      try {
        log.debug(`json-rpc: worker received ${req.method} request`)
        const m = req.method.split('.')

        let host = this // eslint-disable-line @typescript-eslint/no-this-alias
        let method = this[m.shift()]
        while (method && typeof method !== 'function' && m.length) {
          host = method
          method = method[m.shift()]
        }

        if (typeof method !== 'function' || m.length) {
          self.postMessage({ jsonrpc: '2.0', method: req.method, error: { code: METHOD_NOT_FOUND, message: `Method not found: ${ req.method }` }, id: req.id })
          return
        }

        self.postMessage({ jsonrpc: '2.0', method: req.method, result: await method.apply(host, req.params || []), id: req.id })
        log.debug(`json-rpc: worker sent ${req.method} success`)
      }
      catch (err) {
        self.postMessage({ jsonrpc: '2.0', method: req.method, error: { code: INTERNAL_ERROR, message: err.message }, id: req.id })
        log.debug(`json-rpc: worker sent ${req.method} error`)
        return
      }
    })
  }
}
