/* eslint-disable @typescript-eslint/no-this-alias */

import fromPairs from 'lodash.frompairs'

export { fromPairs }

// pick from radash -- WTF would you bother with hasOwnProperty here?!?!
export const pick = <T extends object, TKeys extends keyof T>(obj: T, keys: TKeys[]): Pick<T, TKeys> => {
  if (!obj) return {} as Pick<T, TKeys>
  return keys.reduce((acc, key) => {
    if (typeof obj[key] !== 'undefined') acc[key] = obj[key]
    return acc
  }, {} as Pick<T, TKeys>)
}

export const unpick = <T extends object, TKeys extends keyof T>(obj: T, keys: TKeys[]): Pick<T, TKeys> => {
  if (!obj) return {} as Pick<T, TKeys>

  return (Object.keys(obj) as TKeys[]).reduce((acc, key) => {
    if (!keys.includes(key)) acc[key] = obj[key]
    return acc
  }, {} as Pick<T, TKeys>)
}

export type Predicate<V> = (value: V) => boolean

abstract class FilteredMap<K, V> extends Map<K, V> {
  protected order?(a: V, b: V): number

  get(key: K | Predicate<V>): V | undefined {
    if (typeof key === 'function') {
      for (const v of Map.prototype.values.call(this)) {
        if ((key as Predicate<V>)(v)) return v as V
      }

      return undefined
    }

    return super.get(key)
  }

  clear(filter?: Predicate<V>): void {
    if (!filter) {
      super.clear()
      return
    }

    for (const [k, v] of Map.prototype.entries.call(this)) {
      if (filter(v)) super.delete(k)
    }
  }

  keys(): MapIterator<K>
  keys(filter: Predicate<V>): IterableIterator<K>
  keys(filter?: Predicate<V>): MapIterator<K> | IterableIterator<K> {
    const self = this
    const generator = (function* () {
      for (const [k, v] of Map.prototype.entries.call(self)) {
        if (!filter || filter(v)) yield k
      }
    })()

    return generator as IterableIterator<K> & MapIterator<K>
  }

  values(): MapIterator<V>
  values(filter: Predicate<V>): IterableIterator<V>
  values(filter?: Predicate<V>): MapIterator<V> | IterableIterator<V> {
    const self = this
    const generator = (function* () {
      const items: V[] = []
      for (const v of Map.prototype.values.call(self)) {
        if (!filter || filter(v)) items.push(v)
      }
      if (self.order) items.sort(self.order.bind(self))

      for (const item of items) yield item
    })()

    return generator as IterableIterator<V> & MapIterator<V>
  }

  entries(): MapIterator<[K, V]>
  entries(filter: Predicate<V>): IterableIterator<[K, V]>
  entries(filter?: Predicate<V>): MapIterator<[K, V]> | IterableIterator<[K, V]> {
    const self = this
    const generator = (function* () {
      for (const [k, v] of Map.prototype.entries.call(self)) {
        if (!filter || filter(v)) yield [k, v]
      }
    })()

    return generator as IterableIterator<[K, V]> & MapIterator<[K, V]>
  }
}

export abstract class ObservedMap<K, V> extends FilteredMap<K, V> {
  set(key: K, value: V): this {
    super.set(key, value)
    this.onChange('set', key)
    return this
  }

  delete(key: K): boolean {
    const existed = super.delete(key)
    if (existed) this.onChange('delete', key)
    return existed
  }

  clear(filter?: Predicate<V>): void {
    if (!filter) {
      const hadItems = this.size > 0
      super.clear()
      if (hadItems) this.onChange('clear', undefined)
      return
    }

    for (const [k, v] of Map.prototype.entries.call(this)) {
      if (filter(v)) {
        super.delete(k)
        this.onChange('clear', k)
      }
    }
  }

  protected abstract onChange(method: 'set' | 'delete' | 'clear', key?: K): void
}

export class TrackedMap<K, V> extends FilteredMap<K, V> {
  #isDirty = false

  get isDirty(): boolean { return this.#isDirty }
  resetDirty(): void { this.#isDirty = false }

  set(key: K, value: V): this {
    this.#isDirty = true
    return super.set(key, value)
  }

  delete(key: K): boolean {
    const existed = super.delete(key)
    if (existed) this.#isDirty = true
    return existed
  }

  clear(filter?: Predicate<V>): void {
    const startSize = this.size
    super.clear(filter)
    if (this.size !== startSize) this.#isDirty = true
  }
}
