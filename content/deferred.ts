import type BluebirdPromise from 'bluebird'

export class Deferred<ReturnType> {
  public promise: BluebirdPromise<ReturnType>
  public resolve: (v: ReturnType) => void
  public reject: (e: any) => void
  public isPending: () => boolean

  constructor() {
    this.promise = new Zotero.Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    }) as BluebirdPromise<ReturnType>
    for (const op of ['isPending', 'then', 'catch']) {
      this[op] = this.promise[op]?.bind(this.promise)
    }
    // this.then = this.promise.then.bind(this.promise)
    // this.catch = this.promise.catch.bind(this.promise)
  }
}
