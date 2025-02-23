declare module 'puqeue' {
  type Handler = () => Promise<any>

  class Queue {
    protected _queue: Handler[]

    constructor(options?: { name?: string, maxOperationCount?: number })
    get name(): string
    get maxOperationCount(): number
    set maxOperationCount(maxOperationCount: number)
    get operationCount(): number
    add(todo: Handler, options?: { priority?: number }): Promise<any>
    waitAll(todo: Handler): Promise<any>
  }

  export = Queue
}
