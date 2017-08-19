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

          if index == 0 # details pane
            itemPane.addCitekeyRow()
            display = itemPane.global.document.getElementById(id)
            citekey = KeyManager.get(item.id)
            debug('ItemPane: displaying citekey', display, citekey)
            display.value = citekey.citekey
            display.classList[if citekey.pinned then 'remove' else 'add']('citekey-dynamic')

          return
        )
      )(@global.ZoteroItemPane.viewItem, @)

    @addCitekeyRow()

    observer = new MutationObserver((mutations) =>
      for mutation in mutations
        @addCitekeyRow() if mutation.target.childNodes.length == 1
      return
    )
    observer.observe(@global.document.getElementById('dynamic-fields'), {childList: true})

  addCitekeyRow: ->
    if @global.document.getElementById(id)
      debug('ItemPane: citekey row already present')
      return

    template = @global.document.getElementById(id + '-template')
    row = template.cloneNode(true)
    row.setAttribute('id', id + '-row')
    row.setAttribute('hidden', false)
    row.getElementsByClassName('better-bibtex-citekey-display')[0].setAttribute('id', id)

    fields = @global.document.getElementById('dynamic-fields')
    if fields.childNodes.length > 1
      fields.insertBefore(row, fields.childNodes[1])
    else
      fields.appendChild(row)

    debug('ItemPane: citekey row added')

    return

module.exports = ItemPane
