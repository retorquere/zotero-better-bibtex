/*
export class Deferred<T> extends Promise<T> {
  public resolve: (result: T) => void
  public reject: (err: Error) => void
  public pending = true

  constructor() {
  let resolveSelf, rejectSelf

  super((resolve, reject) => {
    resolveSelf = resolve
    rejectSelf = reject
  })

  this.resolve = resolveSelf
  this.reject = rejectSelf
  this.finally(() => { this.pending = false })
  }
}
*/

export class Deferred<T> implements Promise<T> {
  [Symbol.toStringTag]: 'Promise'

  private _promise: Promise<T>
  private _resolve: (value?: T | PromiseLike<T>) => void
  private _reject: (reason?: any) => void
  private _state: 'pending' | 'fulfilled' | 'rejected' = 'pending'

  public get state(): 'pending' | 'fulfilled' | 'rejected' {
    return this._state
  }
  public get pending(): boolean {
    return this._state === 'pending'
  }
  public get fulfilled(): boolean {
    return this._state === 'fulfilled'
  }
  public get rejected(): boolean {
    return this._state === 'rejected'
  }

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  public then<TResult1, TResult2>(
    onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>)
    : Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected)
  }

  public catch<TResult>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<T | TResult> {
    return this._promise.catch(onrejected)
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this._promise.finally(onfinally)
  }

  public resolve(value?: T | PromiseLike<T>): void {
    this._resolve(value)
    if (this._state === 'pending') this._state = 'fulfilled'
  }

  public reject(reason?: Error): void {
    this._reject(reason)
    if (this._state === 'pending') this._state = 'rejected'
  }
}
