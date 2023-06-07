import { patch as $patch$, unpatch as $unpatch$, Trampoline } from './monkey-patch'
import * as l10n from './l10n'
import { Elements } from './create-element'
import { Events } from './events'

type XULWindow = Window & { arguments: any[], sizeToContent: () => void }
// safe to keep these global as only one export window will ever be open at any one time
var window: XULWindow // eslint-disable-line no-var
var document: Document // eslint-disable-line no-var
var Zotero_File_Interface_Export: any // eslint-disable-line no-var

Events.on('window-loaded', ({ win, href }: {win: Window, href: string}) => {
  if (href === 'chrome://zotero/content/exportOptions.xul') {
    window = win as XULWindow
    document = window.document
    Zotero_File_Interface_Export = (window as any).Zotero_File_Interface_Export
    Zotero.BetterBibTeX.ExportOptions.load()
  }
})

export class ExportOptions {
  private DOM_OBSERVER: MutationObserver = null
  private reset = true
  private patched: Trampoline[] = []
  private elements: Elements

  public load(): void {
    this.DOM_OBSERVER = new MutationObserver(this.addEventHandlers.bind(this))
    this.DOM_OBSERVER.observe(document.getElementById('translator-options'), { attributes: true, subtree: true, childList: true })
    this.addEventHandlers()
    window.addEventListener('unload', () => {
      this.unload()
    })

    this.elements = new Elements(document)
    const translateOptions = document.getElementById('translator-options')
    translateOptions.parentNode.insertBefore(this.elements.create('description', {style: 'color: red', hidden: 'true', id: 'better-bibtex-reminder'}), translateOptions)

    this.mutex()
    this.warning()

    $patch$(Zotero_File_Interface_Export, 'init', original => function(_options) {
      for (const translator of window.arguments[0].translators) {
        if (translator.label === 'BetterBibTeX JSON') translator.label = 'BetterBibTeX debug JSON'
      }
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)
    }, this.patched)

    const self = this // eslint-disable-line @typescript-eslint/no-this-alias
    $patch$(Zotero_File_Interface_Export, 'updateOptions', original => function(_options) {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)
      self.warning()
    }, this.patched)
  }

  public warning(): void {
    const index = (document.getElementById('format-menu') as HTMLSelectElement).selectedIndex
    const translator = (index >= 0) ? window.arguments[0].translators[index].translatorID : null

    let hidden = 'false'
    let textContent = ''
    switch (translator) {
      case 'b6e39b57-8942-4d11-8259-342c46ce395f':
        textContent = l10n.localize('exportOptions.reminder', { translator: 'Better BibLaTeX' })
        break

      case '9cb70025-a888-4a29-a210-93ec52da40d4':
        textContent = l10n.localize('exportOptions.reminder', { translator: 'Better BibTeX' })
        break

      default:
        hidden = 'true'
        break
    }

    const reminder = document.getElementById('better-bibtex-reminder')
    reminder.setAttribute('hidden', hidden)
    reminder.textContent = textContent

    window.sizeToContent()
  }

  public unload(): void {
    this.DOM_OBSERVER.disconnect()
    this.elements.remove()
    $unpatch$(this.patched)
  }

  mutex(e?: Event): void {
    const exportFileData = document.getElementById('export-option-exportFileData') as HTMLInputElement
    const keepUpdated = document.getElementById('export-option-keepUpdated') as HTMLInputElement
    const worker = document.getElementById('export-option-worker') as HTMLInputElement
    const target = e ? e.target as Element : exportFileData

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
  }

  addEventHandlers(): void {
    for (const id of [ 'export-option-exportFileData', 'export-option-keepUpdated', 'export-option-worker' ]) {
      const node = document.getElementById(id) as HTMLInputElement
      if (!node) {
        Zotero.debug(`exportoptions: ${id} not found`)
        break
      }

      if (id === 'export-option-keepUpdated') {
        node.setAttribute('label', l10n.localize('exportOptions.keepUpdated'))
        if (this.reset) {
          node.checked = false
          this.reset = false
        }
      }

      if (id === 'export-option-worker') {
        node.setAttribute('label', l10n.localize('exportOptions.worker'))
      }

      if (node.getAttribute('better-bibtex')) return null

      node.setAttribute('better-bibtex', 'true')
      node.addEventListener('command', this.mutex.bind(this))
    }
  }
}
