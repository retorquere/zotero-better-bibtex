window.addEventListener('load', ->
  ZoteroItemPane.addCitekeyRow()

  observer = new MutationObserver((mutations) ->
    for mutation in mutations
      ZoteroItemPane.addCitekeyRow() if mutation.target.childNodes.length == 1
  )
  observer.observe(document.getElementById('dynamic-fields'), {childList: true})
  return
)

ZoteroItemPane.addCitekeyRow = ->
  id = 'zotero-better-bibtex-itempane-citekey'
  return if document.getElementById(id)

  template = document.getElementById('zotero-better-bibtex-itempane-citekey-template')

  label = template.firstElementChild.cloneNode(true)
  value = template.lastElementChild.cloneNode(true)
  value.id = 'zotero-better-bibtex-itempane-citekey'

  row = document.createElement('row')
  row.appendChild(label)
  row.appendChild(value)

  fields = document.getElementById('dynamic-fields')
  if fields.childNodes.length > 1
    fields.insertBefore(row, fields.childNodes[1])
  else
    fields.appendChild(row)

ZoteroItemPane.viewItem = ((original) ->
  return (item, mode, index) ->
    original.apply(@, arguments)
    if index == 0 # details pane
      ZoteroItemPane.addCitekeyRow()
      display = document.getElementById('zotero-better-bibtex-itempane-citekey')
      citekey = Zotero.BetterBibTeX.keymanager.get(item)
      if citekey
        display.value = citekey.citekey
        display.classList[if citekey.citekeyFormat then 'add' else 'remove']('citekey-dynamic')
      else
        display.value = ''
        Zotero.BetterBibTeX.log("#{item.itemTypeID} has no citekey") unless citekey
  )(ZoteroItemPane.viewItem)
