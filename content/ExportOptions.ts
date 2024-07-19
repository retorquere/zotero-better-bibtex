import { patch as $patch$, unpatch as $unpatch$, Trampoline } from './monkey-patch'
import * as l10n from './l10n'
import { Elements } from './create-element'
import { Events } from './events'
import type { XUL } from '../typings/xul'

type XULWindow = Window & { Zotero_File_Interface_Export?: any, arguments?: any[], sizeToContent?: () => void }
// safe to keep these global as only one export window will ever be open at any one time
let $window: XULWindow // eslint-disable-line no-var
var Zotero_File_Interface_Export: any // eslint-disable-line no-var

Events.on('window-loaded', ({ win, href }: {win: Window, href: string}) => {
  switch (href) {
    case 'chrome://zotero/content/exportOptions.xul':
    case 'chrome://zotero/content/exportOptions.xhtml':
      $window = win as XULWindow
      Zotero_File_Interface_Export = $window.Zotero_File_Interface_Export

      Zotero.BetterBibTeX.ExportOptions.load()

      break
  }
})

export class ExportOptions {
  private patched: Trampoline[] = []
  private elements: Elements

  public load(): void {
    $window.addEventListener('unload', () => {
      this.unload()
    })

    this.elements = new Elements(document)

    this.show()

    const self = this // eslint-disable-line @typescript-eslint/no-this-alias
    $patch$(Zotero_File_Interface_Export, 'updateOptions', original => function(_options) {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)
      self.show()
    }, this.patched)
  }

  private selected(): any {
    const index = ($window.document.getElementById('format-menu') as HTMLSelectElement).selectedIndex
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (index >= 0) ? $window.arguments[0].translators[index] : null
  }

  public show(): void {
    const doc = $window.document

    const selected = this.selected()
    let reminder = doc.getElementById('better-bibtex-reminder')
    if (!selected) {
      if (reminder) reminder.hidden = true
      return
    }

    if (!reminder) {
      const translateOptions = doc.getElementById('translator-options')
      translateOptions.parentNode.insertBefore(reminder = this.elements.create('description', {style: 'color: red', hidden: 'true', id: 'better-bibtex-reminder'}), translateOptions)
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

    const ids = ['exportFileData', 'worker', 'keepUpdated', 'biblatexAPA', 'biblatexChicago'].map(id => `#export-option-${id}`).join(', ')
    for (const node of [...doc.querySelectorAll(ids)] as HTMLInputElement[]) {
      if (node.classList.contains('better-bibex-export-options')) continue
      node.classList.add('better-bibex-export-options')
      node.addEventListener('command', this.mutex.bind(this))

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

    this.mutex()

    $window.sizeToContent()
  }

  public unload(): void {
    this.elements.remove()
    $unpatch$(this.patched)
  }

  mutex(e?: Event): void {
    const doc = $window.document
    const exportFileData = doc.getElementById('export-option-exportFileData') as XUL.Checkbox
    const keepUpdated = doc.getElementById('export-option-keepUpdated') as XUL.Checkbox
    const worker = doc.getElementById('export-option-worker') as XUL.Checkbox
    const biblatexAPA = doc.getElementById('export-option-biblatexAPA') as XUL.Checkbox
    const biblatexChicago = doc.getElementById('export-option-biblatexChicago') as XUL.Checkbox

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
}
