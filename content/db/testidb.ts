import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface Schema extends DBSchema {
  test: {
    value: number
    key: number
  }
}

export async function main(): Promise<boolean> {
  const db: IDBPDatabase<Schema> = await openDB('test', 1, {
    upgrade($db, _oldVersion, _newVersion, _transaction, _event) {
      $db.createObjectStore('test')
    },
  })

  return db !== null

  // unwrap(db).close()
}
