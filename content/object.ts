export { clone, fromPairs } from 'remeda'

// pick from radash -- WTF would you bother with hasOwnProperty here?!?!
export const pick = <T extends object, TKeys extends keyof T>(obj: T, keys: TKeys[]): Pick<T, TKeys> => {
  if (!obj) return {} as Pick<T, TKeys>
  return keys.reduce((acc, key) => {
    if (typeof obj[key] !== 'undefined') acc[key] = obj[key]
    return acc
  }, {} as Pick<T, TKeys>)
}

export function stringify(obj: any): string { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  const seen = new WeakSet()
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        // If we've seen this object before, return a placeholder
        return '[Circular]'
      }
      seen.add(value)
    }
    // Otherwise, proceed with the stringification
    return value // eslint-disable-line @typescript-eslint/no-unsafe-return
  })
}
