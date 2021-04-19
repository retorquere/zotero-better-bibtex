const marker = 'BetterBibTeXMonkeyPatched'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types
export function repatch(object: any, method: string, patcher: ((Function) => Function)): void {
  if (!patch.enabled) return
  object[method] = patcher(object[method])
  object[method][marker] = true
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types
export function patch(object: any, method: string, patcher: ((Function) => Function)): void {
  if (!patch.enabled) return
  if (object[method][marker]) throw new Error(`${method} re-patched`)
  repatch(object, method, patcher)
}

patch.enabled = true
