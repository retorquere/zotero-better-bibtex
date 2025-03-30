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
