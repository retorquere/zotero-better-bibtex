const marker = 'BetterBibTeXMOnkeyPatched'

export = (object, method, patch) => {
  if (object[method][marker]) return
  object[method] = patch(object[method])
  object[method][marker] = true
}
