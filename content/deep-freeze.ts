export const deepFreeze = <T extends object>(obj: T): Readonly<T> => {
  if (obj === null || typeof obj !== 'object') return obj

  Object.values(obj).forEach(v => {
    if (v && typeof v === 'object' && !Object.isFrozen(v)) {
      deepFreeze(v)
    }
  })

  return Object.freeze(obj)
}
