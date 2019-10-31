// __njsTraceDisable__
const marker = 'BetterBibTeXMonkeyPatched'

export function repatch(object, method, patcher) {
  object[method] = patcher(object[method])
  object[method][marker] = true
}

export function patch(object, method, patcher) {
  if (object[method][marker]) throw new Error(`${method} re-patched`)
  repatch(object, method, patcher)
}
