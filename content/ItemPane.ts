import { patch as $patch$ } from './monkey-patch'
// import { sentenceCase } from './text'
import { Events } from './events'
import * as client from './client'
import * as l10n from './l10n'
import { log } from './logger'

var window: Window // eslint-disable-line no-var
var document: Document // eslint-disable-line no-var
var ZoteroItemPane // eslint-disable-line no-var

/*
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

export class ItemPane {
  observer: number

  init(): boolean {
    if (typeof this.observer !== 'undefined' || !Zotero.BetterBibTeX.KeyManager.keys) return false

    this.observer = Zotero.BetterBibTeX.KeyManager.keys.on(['update', 'insert'], () => {
      this.refresh()
    })
    return true
  }

  public refresh(): void {
    // eslint disagrees with the typescript compiler on the return type of querySelector
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    (document.querySelector('#zotero-editpane-item-box') as any).refresh()
  }

  public async load(): Promise<void> {
    await Zotero.BetterBibTeX.ready

    window = Zotero.getMainWindow()
    document = window.document
    ZoteroItemPane = (window as any).ZoteroItemPane

    window.addEventListener('unload', () => {
      this.unload()
    })

    const itempane = this // eslint-disable-line @typescript-eslint/no-this-alias
    $patch$(ZoteroItemPane, 'viewItem', original => async function(_item, _mode, _index) {
      // eslint-disable-next-line prefer-rest-params
      await original.apply(this, arguments)
      itempane.init()
    })

    this.init()

    let itemBoxInstance = document.querySelector('#zotero-editpane-item-box')
    const wait = 5000 // eslint-disable-line no-magic-numbers
    let t = 0
    // WTF
    while (!itemBoxInstance && t < wait) {
      itemBoxInstance = window.document.querySelector('#zotero-editpane-item-box')
      await Zotero.Promise.delay(10) // eslint-disable-line no-magic-numbers
      t += 10 // eslint-disable-line no-magic-numbers
    }

    $patch$((itemBoxInstance as any).__proto__, 'refresh', original => function() {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)

      if (!this.item) {
        log.debug('itemBoxInstance.refresh without an item')
        return
      }

      const citekey = Zotero.BetterBibTeX.KeyManager.get(this.item.itemID)
      if (!citekey) return

      const fieldHeader = document.createElement(client.is7 ? 'th' : 'label')
      fieldHeader.setAttribute('fieldname', 'citationKey')
      const headerContent = `${l10n.localize('better-bibtex.ItemPane.citekey_column')}${citekey.pinned ? ' \uD83D\uDCCC' : ''}`
      if (client.is7) {
        const label = document.createElement('label')
        label.className = 'key'
        label.textContent = headerContent
        fieldHeader.appendChild(label)
      }
      else {
        fieldHeader.setAttribute('value', headerContent)
      }

      // can't be a read-only textbox because that makes blur in the itembox go bananas
      const fieldValue = document.createElementNS('http://www.w3.org/1999/xhtml', 'input')
      fieldValue.setAttribute('readonly', 'true')
      fieldValue.setAttribute('value', citekey.citekey)
      // required attributes
      fieldValue.setAttribute('id', 'itembox-field-value-citationKey')
      fieldValue.setAttribute('fieldName', 'citationKey')

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

Events.on('window-loaded', ({ href }: { href: string }) => {
  Zotero.debug(`ItemPane: ${href}`)
  if (href === 'xchrome://zotero/content/exportOptions.xul') {
    Zotero.ItemPane.load().catch(err => { Zotero.debug(`${err}`) })
  }
})
