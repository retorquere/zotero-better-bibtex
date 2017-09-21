debug = require('./debug.coffee')

KeyManager = require('./keymanager.coffee')
DB = require('./db/main.coffee')

id = 'zotero-better-bibtex-itempane-citekey'

addCitekeyRow = (itemID) ->
  if document.getElementById(id)
    debug('ItemPane: citekey row already present')
    return

  if !(display = document.getElementById(id))
    template = document.getElementById(id + '-template')
    row = template.cloneNode(true)
    row.setAttribute('id', id + '-row')
    row.setAttribute('hidden', false)
    display = row.getElementsByClassName('better-bibtex-citekey-display')[0]
    display.setAttribute('id', id)

    fields = document.getElementById('dynamic-fields')
    if fields.childNodes.length > 1
      fields.insertBefore(row, fields.childNodes[1])
    else
      fields.appendChild(row)

    debug('ItemPane: citekey row added')

  if itemID?
    try
      citekey = KeyManager.get(itemID)
      display.value = citekey.citekey
      display.classList[if citekey.pinned then 'remove' else 'add']('citekey-dynamic')

  return

DOMObserver = null
citekeys = DB.getCollection('citekey')
citekeyObserver = null

load = -> addCitekeyRow()

unload = ->
  DOMObserver.disconnect() if DOMObserver
  citekeys.removeListener(citekeyObserver) if citekeys && citekeyObserver
  return

if !ZoteroItemPane.BetterBibTeX
  ZoteroItemPane.BetterBibTeX = true

  ZoteroItemPane.viewItem = do (original = ZoteroItemPane.viewItem) ->
    return Zotero.Promise.coroutine((item, mode, index) ->
      yield original.apply(@, arguments)

      addCitekeyRow(item.id)

      DOMObserver.disconnect() if DOMObserver
      DOMObserver = new MutationObserver((mutations) -> addCitekeyRow(item.id))
      citekeys.removeListener(citekeyObserver) if citekeys && citekeyObserver
      citekeyObserver = citekeys.on('update', (citekey) -> addCitekeyRow(item.id) if citekey.itemID == item.id) if citekeys
      return
    )

window.addEventListener('load', load, false)
window.addEventListener('unload', unload, false)

# otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
