declare const window: any
declare const document: any
declare const MutationObserver: any
declare const Zotero: any

import debug = require('./debug.ts')

let DOM_OBSERVER = null
let reset = true

function mutex(e) {
  debug('clicked', e.target.id)
  const exportFileData = document.getElementById('export-option-exportFileData')
  const keepUpdated = document.getElementById('export-option-keepUpdated')

  if (!exportFileData || !keepUpdated) return

  keepUpdated.disabled = exportFileData.checked

  if ((e.target.id === exportFileData.id) && exportFileData.checked) {
    keepUpdated.checked = false
  } else if ((e.target.id === keepUpdated.id) && keepUpdated.checked) {
    exportFileData.checked = false
  }
}

function addEventHandlers() {
  for (const id of [ 'export-option-exportFileData', 'export-option-keepUpdated' ]) {
    const node = document.getElementById(id)
    if (!node) break

    if (reset && (id === 'export-option-keepUpdated')) {
      node.checked = false
      reset = false

      node.setAttribute('label', Zotero.BetterBibTeX.getString('exportOptions.keepUpdated'))
    }

    if (node.getAttribute('better-bibtex')) return

    debug('export-options add event handler for ', id)
    node.setAttribute('better-bibtex', 'true')
    node.addEventListener('command', mutex)
  }
}

window.addEventListener('load', () => {
  DOM_OBSERVER = new MutationObserver(addEventHandlers)
  DOM_OBSERVER.observe(document.getElementById('translator-options'), { attributes: true, subtree: true, childList: true })
  addEventHandlers()
}, false)

window.addEventListener('unload', () => {
  DOM_OBSERVER.disconnect()
}, false)

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]

export = true
