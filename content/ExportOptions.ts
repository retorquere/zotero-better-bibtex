declare const window: any
declare const document: any
declare const MutationObserver: any
declare const Zotero_File_Interface_Export: any

import { patch as $patch$ } from './monkey-patch'

let DOM_OBSERVER = null
let reset = true

$patch$(Zotero_File_Interface_Export, 'init', original => function(_options) {
  for (const translator of window.arguments[0].translators) {
    if (translator.label === 'BetterBibTeX JSON') translator.label = 'BetterBibTeX debug JSON'
  }
  // eslint-disable-next-line prefer-rest-params
  original.apply(this, arguments)
})

$patch$(Zotero_File_Interface_Export, 'updateOptions', original => function(_options) {
  // eslint-disable-next-line prefer-rest-params
  original.apply(this, arguments)

  const index = document.getElementById('format-menu').selectedIndex
  const translator = (index >= 0) ? window.arguments[0].translators[index].translatorID : null

  let hidden = false
  let textContent = ''
  switch (translator) {
    case 'b6e39b57-8942-4d11-8259-342c46ce395f':
      textContent = Zotero.BetterBibTeX.getString('exportOptions.reminder', { translator: 'Better BibLaTeX' })
      break

    case '9cb70025-a888-4a29-a210-93ec52da40d4':
      textContent = Zotero.BetterBibTeX.getString('exportOptions.reminder', { translator: 'Better BibTeX' })
      break

    default:
      hidden = true
      break
  }

  const reminder = document.getElementById('better-bibtex-reminder')
  reminder.setAttribute('hidden', hidden)
  reminder.textContent = textContent

  window.sizeToContent()
})

function mutex(e) {
  const exportFileData = document.getElementById('export-option-exportFileData')
  const keepUpdated = document.getElementById('export-option-keepUpdated')

  if (!exportFileData || !keepUpdated) return null

  keepUpdated.disabled = exportFileData.checked

  if ((e.target.id === exportFileData.id) && exportFileData.checked) {
    keepUpdated.checked = false
  }
  else if ((e.target.id === keepUpdated.id) && keepUpdated.checked) {
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

    if (node.getAttribute('better-bibtex')) return null

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
