debug = require('../debug.coffee')

KeyManager = require('../keymanager.coffee')

id = 'zotero-better-bibtex-itempane-citekey'

class ItemPane
  constructor: (@global) ->
    if !@global.ZoteroItemPane.BetterBibTeX
      # prevent multi-patching
      @global.ZoteroItemPane.BetterBibTeX = true

      @global.ZoteroItemPane.viewItem = ((original, itemPane) ->
        return Zotero.Promise.coroutine((item, mode, index) ->
          yield original.apply(@, arguments)

          itemPane.addCitekeyRow(item.id) if index == 0 # details pane

          observer = new MutationObserver((mutations) ->
            itemPane.addCitekeyRow(item.id)
            return
          )
          observer.observe(itemPane.global.document.getElementById('dynamic-fields'), {childList: true})

          return
        )
      )(@global.ZoteroItemPane.viewItem, @)

    @addCitekeyRow()

  addCitekeyRow: (itemID) ->
    if @global.document.getElementById(id)
      debug('ItemPane: citekey row already present')
      return

    if !(display = @global.document.getElementById(id))
      template = @global.document.getElementById(id + '-template')
      row = template.cloneNode(true)
      row.setAttribute('id', id + '-row')
      row.setAttribute('hidden', false)
      display = row.getElementsByClassName('better-bibtex-citekey-display')[0]
      display.setAttribute('id', id)

      fields = @global.document.getElementById('dynamic-fields')
      if fields.childNodes.length > 1
        fields.insertBefore(row, fields.childNodes[1])
      else
        fields.appendChild(row)

      debug('ItemPane: citekey row added')

    if itemID?
      citekey = KeyManager.get(itemID)
      display.value = citekey.citekey
      display.classList[if citekey.pinned then 'remove' else 'add']('citekey-dynamic')

    return

module.exports = ItemPane
