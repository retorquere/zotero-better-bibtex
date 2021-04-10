import { patch as $patch$ } from './monkey-patch'
import { sentenceCase } from './case'

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

export interface ItemPaneConstructable {
  new(globals: any): ItemPane // eslint-disable-line @typescript-eslint/prefer-function-type
}

export class ItemPane {
  globals: Record<string, any>
  observer: number

  constructor(globals: Record<string, any>) {
    this.globals = globals

    const itempane = this // eslint-disable-line @typescript-eslint/no-this-alias
    $patch$(this.globals.ZoteroItemPane, 'viewItem', original => async function(item, _mode, _index) {
      // eslint-disable-next-line prefer-rest-params
      await original.apply(this, arguments)
      itempane.init()

      itempane.display(item.id)
    })

    this.init()
  }

  display(itemID?: number): void {
    let menuitem = this.globals.document.getElementById('zotero-field-transform-menu-better-sentencecase')
    if (!menuitem) {
      Zotero.debug('adding better-sentencecase')
      const zotero_field_transform_menu = this.globals.document.getElementById('zotero-field-transform-menu')
      if (zotero_field_transform_menu) {
        menuitem = zotero_field_transform_menu.appendChild(this.globals.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menuitem'))
        menuitem.setAttribute('id', 'zotero-field-transform-menu-better-sentencecase')
        menuitem.setAttribute('label', 'BBT sentence case')
        menuitem.addEventListener('command', function(_e) { title_sentenceCase.call(this.globals.document.getBindingParent(this), this.globals.document.popupNode) }, false)
      }
    }

    const field = this.globals.document.getElementById('better-bibtex-citekey-display')
    const current = field.getAttribute('itemID')
    Zotero.debug(`ItemPane.display: current=${current}, new=${itemID}`)
    if (typeof itemID !== 'undefined' && current === `${itemID}`) return
    if (typeof itemID === 'undefined') itemID = parseInt(current)

    const citekey = Zotero.BetterBibTeX.KeyManager.get(itemID)
    field.value = citekey.citekey
    field.setAttribute('itemID', `${itemID}`)

    const pin = ' \uD83D\uDCCC'
    const label = this.globals.document.getElementById('better-bibtex-citekey-label')
    label.value = `${label.value.replace(pin, '')}${(citekey.pinned ? pin : '')}`
  }

  init(): boolean {
    if (typeof this.observer !== 'undefined' || !Zotero.BetterBibTeX.KeyManager.keys) return false

    this.observer = Zotero.BetterBibTeX.KeyManager.keys.on(['update', 'insert'], citekey => {
      this.display(citekey.itemID)
    })
    this.display()
    return true
  }

  public async load(): Promise<void> {
    if (!Zotero.BetterBibTeX?.ready) return
    await Zotero.BetterBibTeX.ready
    this.init()
    const itemBox = this.globals.document.getElementById('zotero-editpane-item-box')
    const citekeyBox = this.globals.document.getElementById('better-bibtex-editpane-item-box')

    if (itemBox.parentNode !== citekeyBox.parentNode) {
      itemBox.parentNode.appendChild(citekeyBox.parentNode) // move the vbox into the tabbox
      citekeyBox.parentNode.appendChild(itemBox) // move the itembox into the vbox
    }
    this.display()
  }

  public unload(): void {
    if (Zotero.BetterBibTeX.KeyManager.keys && this.observer) {
      Zotero.BetterBibTeX.KeyManager.keys.removeListener(this.observer)
    }
  }
}
