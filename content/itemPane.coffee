debug = require('./debug.coffee')

KeyManager = require('./keymanager.coffee')

display = (itemID) ->
  field = document.getElementById('better-bibtex-citekey-display')
  debug('itemPane.display:', {changed: itemID, field: field.getAttribute('itemID')})
  return unless field.getAttribute('itemID') == '' + itemID

  citekey = KeyManager.get(itemID)
  field.value = citekey.citekey
  return

observer = null
init = ->
  observer ||= KeyManager.keys?.on(['update', 'insert'], (citekey) ->
    debug('itemPane.update:', citekey)
    return display(citekey.itemID)
  )
  return

load = ->
  init()
  itemBox = document.getElementById('zotero-editpane-item-box')
  citekeyBox = document.getElementById('better-bibtex-editpane-item-box')

  if itemBox.parentNode != citekeyBox.parentNode
    itemBox.parentNode.appendChild(citekeyBox.parentNode) # move the vbox into the tabbox
    citekeyBox.parentNode.appendChild(itemBox) # move the itembox into the vbox

  return

unload = ->
  KeyManager.keys?.removeListener(observer) if observer
  return

if !ZoteroItemPane.BetterBibTeX
  ZoteroItemPane.BetterBibTeX = true

  ZoteroItemPane.viewItem = do (original = ZoteroItemPane.viewItem) ->
    return Zotero.Promise.coroutine((item, mode, index) ->
      yield original.apply(@, arguments)

      init()

      document.getElementById('better-bibtex-citekey-display').setAttribute('itemID', '' + item.id)
      display(item.id)
      return
    )

window.addEventListener('load', load, false)
window.addEventListener('unload', unload, false)

# otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
