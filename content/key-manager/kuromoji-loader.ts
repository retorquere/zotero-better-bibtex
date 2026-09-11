type Request = {
  id: number
  filename: string
}

type Success = {
  id: number
  buffer: ArrayBuffer
}

type Failure = {
  id: number
  error: string
}

declare class ChromeWorker extends Worker { }

class KuromojiLoader {
  private worker: ChromeWorker | undefined
  private nextID = 0
  private pending = new Map<number, { resolve: (buffer: ArrayBuffer) => void; reject: (error: Error) => void }>
  private loading = new Map<string, Promise<ArrayBuffer>>

  public start(): void {
    if (this.worker) return

    this.worker = new ChromeWorker('chrome://zotero-better-bibtex/content/key-manager/kuromoji-worker.js')
    this.worker.addEventListener('message', event => {
      const message = (event as MessageEvent<Success | Failure>).data
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      if ('error' in message) pending.reject(new Error(message.error))
      else pending.resolve(message.buffer)
    })
    this.worker.addEventListener('error', event => {
      const error = new Error(event.message || 'kuromoji worker failed')
      const worker = this.worker
      this.worker = undefined
      worker?.terminate()
      for (const { reject } of this.pending.values()) reject(error)
      this.pending.clear()
      this.loading.clear()
    })
  }

  public stop(): void {
    this.worker?.terminate()
    this.worker = undefined
    const error = new Error('kuromoji worker stopped')
    for (const { reject } of this.pending.values()) reject(error)
    this.pending.clear()
    this.loading.clear()
  }

  public load(filename: string): Promise<ArrayBuffer> {
    if (!this.worker) throw new Error('kuromoji worker is not running')

    const resource = filename.replace(new RegExp('.*[\\\\/]'), '')
    const existing = this.loading.get(resource)
    if (existing) return existing

    const id = this.nextID++
    const promise = new Promise<ArrayBuffer>((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      try {
        this.worker!.postMessage({ id, filename: `chrome://zotero-better-bibtex/content/resource/kuromoji/${resource}` } satisfies Request)
      }
      catch (error) {
        this.pending.delete(id)
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
    this.loading.set(resource, promise)
    return promise.finally(() => {
      if (this.loading.get(resource) === promise) this.loading.delete(resource)
    })
  }
}

export { KuromojiLoader }
