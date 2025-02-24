declare module 'async-indexed-db' {
  class AsyncIndexedDB {
    public name: string
    public db: IDBDatabase

    constructor(name: string, schema: (db: IDBDatabase) => Promise<void>, version: number)

    static proxy(obj: any): any
  }

  export class AsyncIDBObjectStore {
    name: string
    keyPath: string | string[] | null
    indexNames: DOMStringList
    // transaction: IDBTransaction
    autoIncrement: boolean
    add(value: any, key?: IDBValidKey | IDBKeyRange | null): Promise<IDBValidKey>
    clear(): Promise<void>
    // count(key?: IDBValidKey | IDBKeyRange | null): IDBRequest<number>
    // createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): IDBIndex
    // delete(key: IDBValidKey | IDBKeyRange): IDBRequest<void>
    // deleteIndex(indexName: string): void
    // get(key: IDBValidKey | IDBKeyRange): IDBRequest<any>
    // getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]>
    // getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]>
    // getKey(key: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined>
    // index(name: string): IDBIndex
    // openCursor(range?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursorWithValue | null>
    // openKeyCursor(range?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursor | null>
    // put(value: any, key?: IDBValidKey | IDBKeyRange | null): IDBRequest<IDBValidKey>
  }

  export default AsyncIndexedDB
}
