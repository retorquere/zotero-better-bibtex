declare const window: any
declare const document: any
declare const ZoteroItemPane: any
declare const Zotero: any

const debug = require('./debug.ts')
const $patch$ = require('./monkey-patch.ts')

const KEYMANAGER = require('./keymanager.coffee')

function display(itemID) {
  const field = document.getElementById('better-bibtex-citekey-display')
  debug('itemPane.display:', {changed: itemID, field: field.getAttribute('itemID')})
  if (field.getAttribute('itemID') !== `${itemID}`) return

  const citekey = KEYMANAGER.get(itemID)
  field.value = citekey.citekey
  let className = (field.className || '').trim().split(/\s+/).filter(c => c !== 'citekey-dynamic').join(' ')
  if (!citekey.pinned) className = `${className} citekey-dynamic`.trim()
  field.className = className
}

let observer = null
function init() {
  if (observer || !KEYMANAGER.keys) return

  observer = KEYMANAGER.keys.on(['update', 'insert'], citekey => {
    debug('itemPane.update:', citekey)
    display(citekey.itemID)
  })
}

function load() {
  init()
  const itemBox = document.getElementById('zotero-editpane-item-box')
  const citekeyBox = document.getElementById('better-bibtex-editpane-item-box')

  if (itemBox.parentNode !== citekeyBox.parentNode) {
    itemBox.parentNode.appendChild(citekeyBox.parentNode) // move the vbox into the tabbox
    citekeyBox.parentNode.appendChild(itemBox) // move the itembox into the vbox
  }
}

function unload() {
  if (KEYMANAGER.keys && observer) {
    KEYMANAGER.keys.removeListener(observer)
  }
}

if (!ZoteroItemPane.BetterBibTeX) {
  ZoteroItemPane.BetterBibTeX = true

  $patch$(ZoteroItemPane, 'viewItem', original => {
    // don't use async here because I don't know What Zotero does with the result
    return Zotero.Promise.coroutine(function*(item, mode, index) {
      yield original.call(this, item, mode, index)
      init()

      document.getElementById('better-bibtex-citekey-display').setAttribute('itemID', `${item.id}`)
      display(item.id)
    })
  })
}

window.addEventListener('load', load, false)
window.addEventListener('unload', unload, false)

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]

// otherwise typescript won't see this as a module
export = true
