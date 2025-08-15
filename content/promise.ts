export class Deferred<T> {
  #resolve!: (v: T) => void
  #reject!: (err: any) => void
  #pending = true

  #promise: Promise<T> = new Promise((resolve, reject) => {
    this.#resolve = resolve
    this.#reject = reject
  })

  public get promise(): Promise<T> {
    return this.#promise
  }

  public get pending(): boolean {
    return this.#pending
  }

  public resolve(v: T): void {
    if (this.#pending) {
      this.#pending = false
      this.#resolve(v)
    }
  }

  public reject(err: Error): void {
    if (this.#pending) {
      this.#pending = false
      this.#reject(err)
    }
  }
}
