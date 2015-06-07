window.addEventListener('load', ->
  fields = document.getElementById('dynamic-fields')
  row = fields.firstElementChild
  if row.firstElementChild.nodeName == 'label'
    label = {
      bbt: document.getElementById('zotero-better-bibtex-item-first-row-label')
      zotero: row.firstElementChild
    }
    value = {
      bbt: document.getElementById('zotero-better-bibtex-item-first-row-value')
      zotero: row.lastElementChild
    }
    row.appendChild(label.bbt)
    row.appendChild(value.bbt)
    label.bbt.appendChild(label.zotero)
    value.bbt.appendChild(value.zotero)
)

ZoteroItemPane.viewItem = ((original) ->
  return (item, mode, index) ->
    original.apply(@, arguments)
    if index == 0 # details pane
      label = document.getElementById('zotero-better-bibtex-itempane-citekey')
      label.value = Zotero.BetterBibTeX.keymanager.get(item).citekey
  )(ZoteroItemPane.viewItem)
