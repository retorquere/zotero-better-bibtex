namespace BBTWorker {
  type Config = {
    preferences: any,
    options: any,
    items: ISerializedItem[]
    collections: ZoteroCollection[]
    cslItems?: Record<number, any>
    cache: Record<number, {itemID: number, reference: string, metadata: any, meta: { updated: number }}>
  }

  type Message = { kind: 'done', output: boolean | string }
    | { kind: 'debug', message: string }
    | { kind: 'error', message: string }
    | { kind: 'cache', itemID: number, reference: string, metadata: any }
    | { kind: 'item', item: number }
}
