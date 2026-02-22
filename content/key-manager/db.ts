import { Path } from '../file'
import CallbackLoki from 'lokijs'
import { pack, unpack } from 'msgpackr'

class PersistenceAdapter implements LokiPersistenceAdapter {
  public mode = 'reference'

  constructor(private saveFilter: (doc: any) => boolean) {
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  public async loadDatabase(dbname: string, callback: (err: null | Error, data?: any) => void): Promise<void> {
    try {
      if (!(await IOUtils.exists(dbname))) return callback(null)

      if (dbname.endsWith('.json')) {
        const stored = await IOUtils.readUTF8(dbname)
        if (!stored) return callback(null)
        callback(null, JSON.parse(stored))
      }
      else {
        callback(null, unpack(await IOUtils.read(dbname)))
      }
    }
    catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)))
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  public async exportDatabase(dbname: string, dbRef: CallbackLoki, callback: (err: Error | null) => void): Promise<void> {
    try {
      const store = dbRef.copy()

      store.filename = Path.basename(dbname)

      store.collections = dbRef.collections.map(({ data, idIndex, ...collMeta }) => ({ // eslint-disable-line @typescript-eslint/no-unused-vars
        ...collMeta,
        data: data.filter(this.saveFilter),
        idIndex: [],
      })) as any[]

      if (dbname.endsWith('.json')) {
        await IOUtils.writeUTF8(dbname, JSON.stringify(store))
        callback(null)
      }
      else {
        await IOUtils.write(dbname, pack(store), { tmpPath: `${dbname}.tmp` })
      }
    }
    catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)))
    }
  }
}

export type LokiCollection<T extends object> = CallbackLoki.Collection<T>
type LokiOptions = Partial<LokiConstructorOptions & LokiConfigOptions> & { saveFilter?: (doc: any) => boolean }

export class Loki extends CallbackLoki {
  constructor(filename: string, options: LokiOptions = {}) {
    const { saveFilter, ...lokiOptions } = options
    const adapter = new PersistenceAdapter(saveFilter || (() => true))
    super(filename, { ...lokiOptions, adapter })
  }

  public read(options: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadDatabase(options, err => {
        if (err) return reject(err instanceof Error ? err : new Error(String(err)))
        resolve()
      })
    })
  }

  public write(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.saveDatabase(err => {
        if (err) return reject(err instanceof Error ? err : new Error(String(err)))
        resolve()
      })
    })
  }
}
