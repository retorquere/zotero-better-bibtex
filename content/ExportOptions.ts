import { patch as $patch$, unpatch as $unpatch$, Trampoline } from './monkey-patch'
import * as l10n from './l10n'
import { Elements } from './create-element'
import { Events } from './events'
import { log } from './logger'

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
    log.debug('export-options.show:', selected)
    let reminder = doc.getElementById('better-bibtex-reminder')
    if (!selected) {
      if (reminder) reminder.hidden = true
      return
    }

    if (!reminder) {
      const translateOptions = doc.getElementById('translator-options')
      translateOptions.parentNode.insertBefore(reminder = this.elements.create('description', {style: 'color: red', hidden: 'true', id: 'better-bibtex-reminder'}), translateOptions)
      log.debug('export-options.show: added reminder')
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

    for (const node of [...doc.querySelectorAll('#export-option-exportFileData, #export-option-keepUpdated, #export-option-worker')]) {
      if (node.classList.contains('better-bibex-export-options')) continue
      log.debug('export-options.show: added listener to', node.getAttribute('id'))
      node.classList.add('better-bibex-export-options')
      node.addEventListener('command', this.mutex.bind(this))

      switch (node.getAttribute('id')) {
        case 'export-option-keepUpdated':
          node.setAttribute('label', l10n.localize('better-bibtex_export-options_keep-updated'))
          break
        case 'export-option-worker':
          (node as any).checked = false
          node.setAttribute('label', l10n.localize('better-bibtex_export-options_worker'))
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
    const exportFileData = doc.getElementById('export-option-exportFileData') as HTMLInputElement
    const keepUpdated = doc.getElementById('export-option-keepUpdated') as HTMLInputElement
    const worker = doc.getElementById('export-option-worker') as HTMLInputElement
    const target = e ? e.target as Element : exportFileData

    log.debug('export-options.mutex: start:', {
      exportFileData: exportFileData ? exportFileData.checked : null,
      keepUpdated: keepUpdated ? keepUpdated.checked : null,
      worker: worker ? worker.checked : null,
    })

    if (!exportFileData || !keepUpdated) return null

    if (target.id === exportFileData.id && exportFileData.checked) {
      keepUpdated.checked = false
    }
    else if (target.id === keepUpdated.id && keepUpdated.checked) {
      exportFileData.checked = false
      worker.checked = true
    }

    keepUpdated.disabled = exportFileData.checked
    worker.disabled = keepUpdated.checked

    log.debug('export-options.mutex: done:', {
      exportFileData: exportFileData ? exportFileData.checked : null,
      keepUpdated: keepUpdated ? keepUpdated.checked : null,
      worker: worker ? worker.checked : null,
    })
  }
}
