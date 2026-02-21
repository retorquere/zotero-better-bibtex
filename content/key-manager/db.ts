import CallbackLoki from 'lokijs'

class PersistenceAdapter implements LokiPersistenceAdapter {
  mode: string = 'reference'

  constructor(private saveFilter: (doc: any) => boolean) {
  }

  public async loadDatabase(dbname: string, callback: (data: any) => void): Promise<void> {
    try {
      if (!(await IOUtils.exists(db))) return callback(null)
      const stored = await IOUtils.readUTF8(dbname)
      if (!stored) return callback(null)

      callback(JSON.parse(stored))
    }
    catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)))
    }
  }

  public async exportDatabase(dbname: string, dbRef: CallbackLoki, callback: (err: Error | null) => void): Promise<void> {
    try {
      const store = dbRef.copy()

      store.collections = dbRef.collections.map((coll) => ({
        ...coll,
        data: coll.data.filter(this.saveFilter),
        idIndex: [], // indices are rebuilt by Loki upon loading/hydration
        binaryIndices: coll.binaryIndices,
        uniqueNames: coll.uniqueNames,
        transforms: coll.transforms
      }))

      await IOUtils.writeUTF8(dbname, JSON.stringify(store))
      callback(null)
    }
    catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)))
    }
  }
}

export type LokiCollection<T extends object> = CallbackLoki.Collection<T>

export class Loki extends CallbackLoki {
  constructor(filename: string, options: Partial<LokiConstructorOptions> & { saveFilter?: (doc: any) => boolean } = {}) {
    const { saveFilter, ...lokiOptions } = options
    const adapter = new PersistenceAdapter(saveFilter || (() => true))
    super(filename, { ...lokiOptions, adapter })
  }

  public load(options: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadDatabase(options, (err) => {
        if (err && err !== null) return reject(err)
        resolve()
      })
    })
  }

  public save(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.saveDatabase((err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}
