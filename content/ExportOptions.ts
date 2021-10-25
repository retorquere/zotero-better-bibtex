import { patch as $patch$ } from './monkey-patch'
import * as l10n from './l10n'

export class ExportOptions {
  private globals: Record<string, any>
  private DOM_OBSERVER: MutationObserver = null
  private reset = true

  public load(globals: Record<string, any>): void {
    this.globals = globals
    this.DOM_OBSERVER = new MutationObserver(this.addEventHandlers.bind(this))
    this.DOM_OBSERVER.observe(this.globals.document.getElementById('translator-options'), { attributes: true, subtree: true, childList: true })
    this.addEventHandlers()

    $patch$(this.globals.Zotero_File_Interface_Export, 'init', original => function(_options) {
      for (const translator of this.globals.window.arguments[0].translators) {
        if (translator.label === 'BetterBibTeX JSON') translator.label = 'BetterBibTeX debug JSON'
      }
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)
    })

    $patch$(this.globals.Zotero_File_Interface_Export, 'updateOptions', original => function(_options) {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)

      const index = this.globals.document.getElementById('format-menu').selectedIndex
      const translator = (index >= 0) ? this.globals.window.arguments[0].translators[index].translatorID : null

      let hidden = false
      let textContent = ''
      switch (translator) {
        case 'b6e39b57-8942-4d11-8259-342c46ce395f':
          textContent = l10n.localize('exportOptions.reminder', { translator: 'Better BibLaTeX' })
          break

        case '9cb70025-a888-4a29-a210-93ec52da40d4':
          textContent = l10n.localize('exportOptions.reminder', { translator: 'Better BibTeX' })
          break

        default:
          hidden = true
          break
      }

      const reminder = this.globals.document.getElementById('better-bibtex-reminder')
      reminder.setAttribute('hidden', hidden)
      reminder.textContent = textContent

      this.globals.window.sizeToContent()
    })
  }

  public unload(): void {
    this.DOM_OBSERVER.disconnect()
  }

  mutex(e: Event): void {
    const exportFileData = this.globals.document.getElementById('export-option-exportFileData')
    const keepUpdated = this.globals.document.getElementById('export-option-keepUpdated')
    const target = e.target as Element

    if (!exportFileData || !keepUpdated) return null

    keepUpdated.disabled = exportFileData.checked

    if ((target.id === exportFileData.id) && exportFileData.checked) {
      keepUpdated.checked = false
    }
    else if ((target.id === keepUpdated.id) && keepUpdated.checked) {
      exportFileData.checked = false
    }
  }

  addEventHandlers(): void {
    for (const id of [ 'export-option-exportFileData', 'export-option-keepUpdated' ]) {
      const node = this.globals.document.getElementById(id)
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

      if (node.getAttribute('better-bibtex')) return null

      node.setAttribute('better-bibtex', 'true')
      node.addEventListener('command', this.mutex.bind(this))
    }
  }
}
