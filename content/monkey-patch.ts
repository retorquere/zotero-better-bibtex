const marker = 'BetterBibTeXMonkeyPatched'

export function patch(object, method, patcher) {
  if (object[method][marker]) return
  object[method] = patcher(object[method])
  object[method][marker] = true
}
