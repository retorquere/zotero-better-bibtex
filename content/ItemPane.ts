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

  private display(itemID?: number): void {
    const menuid = 'zotero-field-transform-menu-better-sentencecase'
    let menuitem = this.globals.document.getElementById(menuid)
    const menu = this.globals.document.getElementById('zotero-field-transform-menu')
    if (menu && !menuitem) {
      Zotero.debug('adding better-sentencecase')
      menuitem = menu.appendChild(this.globals.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menuitem'))
      menuitem.setAttribute('id', menuid)
      menuitem.setAttribute('label', 'BBT sentence case')
      const itempane = this // eslint-disable-line @typescript-eslint/no-this-alias
      menuitem.addEventListener('command', function(_e) { title_sentenceCase.call(itempane.globals.document.getBindingParent(this), itempane.globals.document.popupNode) }, false)
    }

    const pin = ' \uD83D\uDCCC'
    const field = this.globals.document.getElementById('better-bibtex-citekey-display')
    const label = this.globals.document.getElementById('better-bibtex-citekey-label')
    const displayed = {
      itemID: field.getAttribute('itemID') || '',
      citekey: field.value || '',
      pinned: (label.value || '').includes(pin),
    }
    if (typeof itemID === 'undefined') {
      itemID = parseInt(displayed.itemID)
      if (isNaN(itemID)) itemID = undefined
    }
    const item: { itemID?: string, citekey?: string, pinned?: boolean } = (typeof itemID === 'number' ? Zotero.BetterBibTeX.KeyManager.get(itemID) : undefined) || {}
    if (typeof item.itemID !== 'undefined') item.itemID = `${item.itemID}`

    if (typeof displayed.itemID === 'undefined' && typeof item.itemID === 'undefined') return
    if (item.citekey === displayed.citekey && item.pinned === displayed.pinned) return

    field.value = item.citekey || ''
    field.setAttribute('itemID', item.itemID || '')
    label.value = `${label.value.replace(pin, '')}${item.pinned ? pin : ''}`
  }

  init(): boolean {
    if (typeof this.observer !== 'undefined' || !Zotero.BetterBibTeX.KeyManager.keys) return false

    this.observer = Zotero.BetterBibTeX.KeyManager.keys.on(['update', 'insert'], citekey => {
      this.display(citekey.itemID)
    })
    this.display()
    return true
  }

  public async load(globals: Record<string, any>): Promise<void> {
    if (!Zotero.BetterBibTeX?.ready) return
    await Zotero.BetterBibTeX.ready

    this.globals = globals

    const itempane = this // eslint-disable-line @typescript-eslint/no-this-alias
    $patch$(this.globals.ZoteroItemPane, 'viewItem', original => async function(item, _mode, _index) {
      // eslint-disable-next-line prefer-rest-params
      await original.apply(this, arguments)
      itempane.init()

      itempane.display(item.id)
    })

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
