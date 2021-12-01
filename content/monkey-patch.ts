const marker = 'BetterBibTeXMonkeyPatched'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types
export function repatch(object: any, method: string, patcher: ((Function) => Function)): void {
  if (!patch.enabled) return
  const patched = object[method][marker] || object[method]
  object[method] = patcher(patched)
  object[method][marker] = patched
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types
export function patch(object: any, method: string, patcher: ((Function) => Function)): void {
  if (!patch.enabled) return
  if (object[method][marker]) throw new Error(`${method} re-patched`)
  repatch(object, method, patcher)
}

patch.enabled = true
