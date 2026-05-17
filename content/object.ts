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

abstract class FilteredMap<K, V> {
  readonly #map: Map<K, V>

  constructor(entries?: readonly (readonly [K, V])[] | null) {
    this.#map = new Map<K, V>(entries)
  }

  protected abstract order?(a: V, b: V): number

  get size(): number { return this.#map.size }
  has(key: K): boolean { return this.#map.has(key) }
  set(key: K, value: V): this {
    this.#map.set(key, value)
    return this
  }
  delete(key: K): boolean { return this.#map.delete(key) }

  get(key: K | Predicate<V>): V | undefined {
    if (typeof key === 'function') {
      for (const v of this.#map.values()) {
        if ((key as Predicate<V>)(v)) return v
      }

      return undefined
    }

    return this.#map.get(key)
  }

  clear(filter?: Predicate<V>): void {
    if (!filter) {
      this.#map.clear()
      return
    }

    for (const [k, v] of this.#map.entries()) {
      if (filter(v)) this.#map.delete(k)
    }
  }

  keys(filter?: Predicate<V>): K[] {
    if (!filter) return Array.from(this.#map.keys())

    const keys: K[] = []
    for (const [k, v] of this.#map.entries()) {
      if (filter(v)) keys.push(k)
    }
    return keys
  }

  values(filter?: Predicate<V>): V[] {
    let values: V[]

    if (!filter) {
      values = Array.from(this.#map.values())
    }
    else {
      values = []
      for (const v of this.#map.values()) {
        if (filter(v)) values.push(v)
      }
    }

    if (this.order) {
      values.sort(this.order.bind(this))
    }

    return values
  }

  /**
   * Returns [key, value] pairs as an array, optionally filtered and sorted.
   */
  entries(filter?: Predicate<V>): [K, V][] {
    let entries: [K, V][]

    if (!filter) {
      entries = Array.from(this.#map.entries())
    }
    else {
      entries = []
      for (const entry of this.#map.entries()) {
        if (filter(entry[1])) entries.push(entry)
      }
    }

    if (this.order) entries.sort((a, b) => this.order(a[1], b[1]))

    return entries
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.#map.entries()
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

  protected order: ((a: V, b: V) => number) | undefined = undefined
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

  protected order: ((a: V, b: V) => number) | undefined = undefined
}
