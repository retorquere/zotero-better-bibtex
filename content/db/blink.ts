import { Entity, PrimaryKeyOf, Table, Query } from 'blinkdb'

export function first<T extends Entity<T>, P extends PrimaryKeyOf<T>>(table: Table<T, P>, queryOrId?: Query<T, P> | T[P]): T | null {
  if (queryOrId === undefined) {
    const btree = table[BlinkKey].storage.primary
    const minKey = btree.minKey()
    const entity = minKey ? btree.get(minKey) ?? null : null
    return TableUtils.cloneIfNecessary(table, entity)
  }
  else if (typeof queryOrId !== "object") {
    const entity = table[BlinkKey].storage.primary.get(queryOrId) ?? null
    return TableUtils.cloneIfNecessary(table, entity)
  }

  const res = get(table, queryOrId)
  if (!res[0]) return null
  return TableUtils.cloneIfNecessary(table, res[0])
}

export function many<T extends Entity<T>, P extends PrimaryKeyOf<T>>(table: Table<T, P>, query?: Query<T, P>): T[] {
  if (query === undefined) {
    const allItems = table[BlinkKey].storage.primary.valuesArray()
    return TableUtils.cloneIfNecessary(table, allItems)
  }

  const items = get(table, query)

  return TableUtils.cloneIfNecessary(table, items)
}
