import { Monkey } from './monkey-patch'
import * as l10n from './l10n'
import { Events } from './events'
import type { XUL } from '../typings/xul'

let enabled = true

export function enable(): void {
  enabled = true
}
export function disable(): void {
  enabled = false
}

type XULWindow = Window & { bbtmonkey?: Monkey; Zotero_File_Interface_Export?: any; arguments?: any[]; sizeToContent?: () => void }

Events.on('window-loaded', ({ win, href }: { win: Window; href: string }) => {
  if (!enabled || href !== 'chrome://zotero/content/exportOptions.xhtml') return

  const window: XULWindow = win
  const document = window.document

  window.addEventListener('unload', () => {
    const reminder: HTMLElement = document.getElementById('better-bibtex-reminder')
    if (reminder) reminder.hidden = true
    window.bbtmonkey?.disable()
  })

  function mutex(e?: Event): void {
    const exportFileData = document.getElementById('export-option-exportFileData') as XUL.Checkbox
    const keepUpdated = document.getElementById('export-option-keepUpdated') as XUL.Checkbox
    const worker = document.getElementById('export-option-worker') as XUL.Checkbox
    const biblatexAPA = document.getElementById('export-option-biblatexAPA') as XUL.Checkbox
    const biblatexChicago = document.getElementById('export-option-biblatexChicago') as XUL.Checkbox

    if (!exportFileData || !keepUpdated) return null

    if (!e) keepUpdated.checked = false

    const target = e ? e.target as Element : exportFileData
    switch (target.id) {
      case exportFileData.id:
        if (exportFileData.checked) keepUpdated.checked = false
        break
      case keepUpdated.id:
        if (keepUpdated.checked) {
          exportFileData.checked = false
          worker.checked = true
        }
        break
      case biblatexAPA.id:
        if (biblatexAPA.checked) biblatexChicago.checked = false
        break
      case biblatexChicago.id:
        if (biblatexChicago.checked) biblatexAPA.checked = false
        break
    }
    worker.disabled = keepUpdated.checked
  }

  function show() {
    const index = (document.getElementById('format-menu') as HTMLSelectElement).selectedIndex
    const selected = (index >= 0) ? window.arguments[0].translators[index] : null

    let reminder: HTMLElement = document.getElementById('better-bibtex-reminder')

    if (!selected) {
      if (reminder) reminder.hidden = true
      return
    }

    if (!reminder) {
      const translateOptions = document.getElementById('translator-options')
      reminder = document.createXULElement('description') as HTMLElement
      reminder.setAttribute('style', 'color: red')
      reminder.hidden = true
      reminder.setAttribute('id', 'better-bibtex-reminder')
      translateOptions.parentNode.insertBefore(reminder, translateOptions)
    }

    switch (selected.translatorID) {
      case 'b6e39b57-8942-4d11-8259-342c46ce395f':
        reminder.hidden = false
        reminder.textContent = l10n.localize('better-bibtex_export-options_reminder', { translator: 'Better BibLaTeX' })
        break

      case '9cb70025-a888-4a29-a210-93ec52da40d4':
        reminder.textContent = l10n.localize('better-bibtex_export-options_reminder', { translator: 'Better BibTeX' })
        reminder.hidden = false
        break

      default:
        reminder.hidden = true
        break
    }

    const ids = [ 'exportFileData', 'worker', 'keepUpdated', 'biblatexAPA', 'biblatexChicago' ].map(id => `#export-option-${ id }`).join(', ')
    for (const node of [...document.querySelectorAll(ids)] as HTMLInputElement[]) {
      if (node.classList.contains('better-bibex-export-options')) continue
      node.classList.add('better-bibex-export-options')
      node.addEventListener('command', mutex)

      switch (node.id) {
        case 'export-option-keepUpdated':
          node.checked = false
          node.setAttribute('label', l10n.localize('better-bibtex_export-options_keep-updated'))
          break
        case 'export-option-worker':
          node.setAttribute('label', l10n.localize('better-bibtex_export-options_worker'))
          break
        case 'export-option-biblatexAPA':
          node.setAttribute('label', l10n.localize('better-bibtex_export-options_biblatexAPA'))
          break
        case 'export-option-biblatexChicago':
          node.setAttribute('label', l10n.localize('better-bibtex_export-options_biblatexChicago'))
          break
      }
    }

    mutex()

    window.sizeToContent()
  }

  if (window.bbtmonkey) {
    window.bbtmonkey.enable()
  }
  else {
    window.bbtmonkey = new Monkey(true)
    window.bbtmonkey.patch(window.Zotero_File_Interface_Export, 'updateOptions', original => function(_options) {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)
      show()
    })
  }

  show()
})
