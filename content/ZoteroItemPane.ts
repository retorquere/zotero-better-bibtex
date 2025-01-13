import { Monkey } from './monkey-patch'
import * as l10n from './l10n'
import { Elements } from './create-element'
import { icons } from './icons'
import { Events } from './events'

export class ZoteroItemPane {
  private monkey = new Monkey(true)
  document: Document
  elements: Elements
  displayed: number
  done: () => void

  public refresh(): void {
    this.itemBox.refresh()
  }

  constructor(win: Window, private itemBox: any) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    this.document = win.document

    const self = this // eslint-disable-line @typescript-eslint/no-this-alias
    this.monkey.patch(itemBox.__proto__, 'refresh', original => function() {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)

      if (!this.item) {
        // why is it refreshing if there is no item?!
        self.displayed = undefined
        return
      }

      self.displayed = this.item.id

      const { citationKey, pinned } = Zotero.BetterBibTeX.KeyManager.get(this.item.id)
      const label = this.parentNode.querySelector('#better-bibtex-citekey-label')
      const value = this.parentNode.querySelector('#better-bibtex-citekey-display')
      if (!value) return // merge pane uses itembox

      label.hidden = value.hidden = !citationKey

      label.value = `${ pinned ? icons.pin : '' }${ l10n.localize('better-bibtex_item-pane_info_citation-key_label') }`
      value.value = citationKey
    })

    this.done = Events.on('items-changed', ({ items }) => {
      if (this.document && items.map(item => item.id).includes(this.displayed)) this.refresh()
    })
  }

  public unload(): void {
    this.elements.remove()
    this.done?.()
    this.document = undefined
    this.monkey.disable()
  }
}
