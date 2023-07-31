import { patch as $patch$ } from './monkey-patch'
import { sentenceCase } from './text'
import * as client from './client'
import * as l10n from './l10n'
import { log } from './logger'
import { Elements } from './create-element'
import { busyWait } from './busy-wait'
import { icons } from './icons'

/**
 * TODO: work with textboxes too // FROM ZOTERO
 */
async function textTransformField(label) {
  const val = this._getFieldValue(label)
  const newVal = sentenceCase(val)
  this._setFieldValue(label, newVal)
  const fieldName = label.getAttribute('fieldname')
  this._modifyField(fieldName, newVal)

  // If this is a title field, convert the Short Title too
  const isTitle = Zotero.ItemFields.getBaseIDFromTypeAndField(this.item.itemTypeID, fieldName) === Zotero.ItemFields.getID('title')
  const shortTitleVal = this.item.getField('shortTitle')
  if (isTitle && newVal.toLowerCase().startsWith(shortTitleVal.toLowerCase())) {
    this._modifyField('shortTitle', newVal.substr(0, shortTitleVal.length))
  }

  if (this.saveOnEdit) {
    // If a field is open, blur it, which will trigger a save and cause
    // the saveTx() to be a no-op
    await this.blurOpenField()
    await this.item.saveTx()
  }
}

export async function newZoteroItemPane(win: Window): Promise<void> {
  let itemBoxInstance: HTMLElement
  if (client.is7) {
    const ItemBox = win.customElements.get('item-box')
    itemBoxInstance = new ItemBox
  }
  else {
    await busyWait(() => { itemBoxInstance = win.document.querySelector('#zotero-editpane-item-box'); return !!itemBoxInstance })
  }
  new ZoteroItemPane(win, itemBoxInstance)
}

export class ZoteroItemPane {
  observer: number
  document: Document
  elements: Elements

  public refresh(): void {
    this.itemBoxInstance.refresh()
  }

  constructor(win: Window, private itemBoxInstance: any) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    this.document = win.document
    const elements = this.elements = new Elements(this.document)
    const itemPane = (win as any).ZoteroItemPane
    itemPane.BetterBibTeX = this

    if (!this.document.getElementById('better-bibtex-transform-sentence-case')) {
      this.document.getElementById('zotero-field-transform-menu').appendChild(
        elements.create('menuitem', {
          label: 'BBT sentence-case',
          id: 'better-bibtex-transform-sentence-case',
          class: 'menuitem-non-iconic',
          oncommand: () => { textTransformField.call(this.itemBoxInstance, (this.document as any).popupNode) },
        })
      )
    }

    this.observer = Zotero.BetterBibTeX.KeyManager.keys.on(['update', 'insert'], () => {
      this.refresh()
    })

    win.addEventListener('unload', () => {
      this.unload()
    })

    $patch$(itemBoxInstance.__proto__, 'refresh', original => function() {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)

      if (!this.item) {
        // why is it refreshing if there is no item?!
        log.debug('itemBoxInstance.refresh without an item')
        return
      }

      const citekey = Zotero.BetterBibTeX.KeyManager.get(this.item.itemID)
      if (!citekey) return

      const headerContent = `${l10n.localize('better-bibtex_item-pane_citekey')}${citekey.pinned ? ` ${icons.pin}` : ''}`
      const header = client.is7

        ? elements
          .create('th', {
            onclick: ev => { ev.currentTarget.nextElementSibling?.querySelector('input, textarea')?.blur() },
            fieldname: 'citationKey',
          })
          .appendChild(elements.create('label', { class: 'key', value: headerContent }))
          .parentElement

        : elements
          .create('label', {
            onclick: ev => { ((ev.currentTarget as HTMLElement).nextElementSibling as any)?.inputField?.blur() },
            value: headerContent,
            fieldname: 'citationKey',
          })

      const table = client.is7 ? this._infoTable : this._dynamicFields // eslint-disable-line no-underscore-dangle
      const beforeRow = table.children[1] // item type must be first
      if (beforeRow) this._beforeRow = beforeRow

      const value = this.createValueElement(citekey.citekey, 'citationKey', 1099) // eslint-disable-line no-magic-numbers
      this.addDynamicRow(header, value, beforeRow)
    })
  }

  public unload(): void {
    if (Zotero.BetterBibTeX.KeyManager.keys && this.observer) {
      Zotero.BetterBibTeX.KeyManager.keys.removeListener(this.observer)
    }
  }
}
