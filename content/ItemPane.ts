declare const window: any
declare const document: any
declare const ZoteroItemPane: any
declare const Zotero: any

import { patch as $patch$ } from './monkey-patch'

import { KeyManager } from './key-manager'

function display(itemID) {
  const field = document.getElementById('better-bibtex-citekey-display')
  if (field.getAttribute('itemID') !== `${itemID}`) return null

  const citekey = KeyManager.get(itemID)
  field.value = citekey.citekey
  let className = (field.className || '').trim().split(/\s+/).filter(c => c !== 'citekey-dynamic').join(' ')
  if (!citekey.pinned) className = `${className} citekey-dynamic`.trim()
  field.className = className
}

let observer = null
function init() {
  if (observer || !KeyManager.keys) return null

  observer = KeyManager.keys.on(['update', 'insert'], citekey => {
    display(citekey.itemID)
  })
}

function load() {
  Zotero.BetterBibTeX.ready.then(() => {
    init()
    const itemBox = document.getElementById('zotero-editpane-item-box')
    const citekeyBox = document.getElementById('better-bibtex-editpane-item-box')

    if (itemBox.parentNode !== citekeyBox.parentNode) {
      itemBox.parentNode.appendChild(citekeyBox.parentNode) // move the vbox into the tabbox
      citekeyBox.parentNode.appendChild(itemBox) // move the itembox into the vbox
    }
  })
}

function unload() {
  if (KeyManager.keys && observer) {
    KeyManager.keys.removeListener(observer)
  }
}

$patch$(ZoteroItemPane, 'viewItem', original => {
  // don't use async here because I don't know What Zotero does with the result
  return Zotero.Promise.coroutine(function*(item, mode, index) {
    yield original.call(this, item, mode, index)
    init()

    document.getElementById('better-bibtex-citekey-display').setAttribute('itemID', `${item.id}`)
    display(item.id)
  })
})

window.addEventListener('load', load, false)
window.addEventListener('unload', unload, false)

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]

// otherwise typescript won't see this as a module
export = true
