namespace BBTWorker {
  type Config = {
    preferences: any,
    options: any,
    items: any[]
    collections: any[]
    cslItems?: Record<number, any>
  }

  type Message = { kind: 'done', output: boolean | string } | { kind: 'debug', message: string } | { kind: 'error', message: string }
}
