export const deepFreeze = <T>(obj: T): T => {
  Object.values(obj).forEach(v => {
    if (typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v)
  })
  return Object.freeze(obj)
}
