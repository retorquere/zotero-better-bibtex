import { patch as $patch$ } from './monkey-patch'
// import { sentenceCase } from './text'
import * as client from './client'
import * as l10n from './l10n'
import { log } from './logger'
import { Elements, NAMESPACE } from './create-element'

/* REVIEW:
async function title_sentenceCase(label) {
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
*/

export async function newZoteroItemPane(doc: Document): Promise<void> {
  let itemBoxInstance: HTMLElement
  if (client.is7) {
    itemBoxInstance = (new (doc.defaultView.customElements.get('item-box')))()
  }
  else {
    const wait = 5000 // eslint-disable-line no-magic-numbers
    let t = 0
    // WTF
    while (!(itemBoxInstance = doc.querySelector('#zotero-editpane-item-box')) && t < wait) {
      await Zotero.Promise.delay(10) // eslint-disable-line no-magic-numbers
      t += 10 // eslint-disable-line no-magic-numbers
    }
    if (!itemBoxInstance) throw new Error(`could not find #zotero-editpane-item-box after ${wait}ms`)
  }
  new ZoteroItemPane(doc, itemBoxInstance)
}

export class ZoteroItemPane {
  observer: number
  document: Document
  elements: Elements

  public refresh(): void {
    // eslint disagrees with the typescript compiler on the return type of querySelector
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    (this.document.querySelector('#zotero-editpane-item-box') as any).refresh()
  }

  constructor(doc: Document, itemBoxInstance: any) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    this.document = doc
    const elements = this.elements = new Elements(doc)
    const win = doc.defaultView
    const itemPane = (win as any).ZoteroItemPane
    itemPane.BetterBibTeX = this

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
        log.debug('itemBoxInstance.refresh without an item')
        return
      }

      const citekey = Zotero.BetterBibTeX.KeyManager.get(this.item.itemID)
      if (!citekey) return

      const fieldHeader = elements.create(client.is7 ? 'th' : 'label')
      fieldHeader.setAttribute('fieldname', 'citationKey')
      const headerContent = `${l10n.localize('better-bibtex.ItemPane.citekey_column')}${citekey.pinned ? ' \uD83D\uDCCC' : ''}`
      if (client.is7) {
        const label = elements.create('label')
        label.className = 'key'
        label.textContent = headerContent
        fieldHeader.appendChild(label)
      }
      else {
        fieldHeader.setAttribute('value', headerContent)
      }

      // can't be a read-only textbox because that makes blur in the itembox go bananas
      const fieldValue = elements.create('input', {
        readonly: 'true',
        value: citekey.citekey,
        id: 'itembox-field-value-citationKey',
        fieldName: 'citationKey',
      }, NAMESPACE.HTML)

      const table = client.is7 ? this._infoTable : this._dynamicFields // eslint-disable-line no-underscore-dangle
      const fieldIndex = 1
      if (fieldIndex < table.children.length) {
        this._beforeRow = table.children[fieldIndex]
        this.addDynamicRow(fieldHeader, fieldValue, true)
      }
      else {
        this.addDynamicRow(fieldHeader, fieldValue)
      }
    })
  }

  public unload(): void {
    if (Zotero.BetterBibTeX.KeyManager.keys && this.observer) {
      Zotero.BetterBibTeX.KeyManager.keys.removeListener(this.observer)
    }
  }
}
