import { patch as $patch$ } from './monkey-patch'
import { sentenceCase } from './text'
import * as client from './client'
import * as l10n from './l10n'
import { log } from './logger'
import { Elements } from './create-element'
import { busyWait } from './busy-wait'
import { icons } from './icons'
import { is7 } from './client'

async function title_sentenceCase(label) {
  const val = this._getFieldValue(label)
  const newVal = sentenceCase(val)
  this._setFieldValue(label, newVal)
  const fieldName = label.getAttribute('fieldname')
  this._modifyField(fieldName, newVal)
  const isTitle = Zotero.ItemFields.getBaseIDFromTypeAndField(this.item.itemTypeID, fieldName) === Zotero.ItemFields.getID('title')
  const shortTitleVal = this.item.getField('shortTitle')
  if (isTitle && newVal.toLowerCase().startsWith(shortTitleVal.toLowerCase())) {
    this._modifyField('shortTitle', newVal.substr(0, shortTitleVal.length))
  }
  if (this.saveOnEdit) {
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
    // const itemPane = (win as any).ZoteroItemPane
    // itemPane.BetterBibTeX = this

    if (!is7) {
      const menuid = 'zotero-field-transform-menu-better-sentencecase'
      let menuitem = this.document.getElementById(menuid)
      const menu = this.document.getElementById('zotero-field-transform-menu')
      if (menu && !menuitem) {
        menuitem = menu.appendChild(elements.create('menuitem', {
          id: menuid,
          label: 'BBT sentence case',
          oncommand: () => {
            title_sentenceCase.call((this.document as any).getBindingParent(this), (this.document as any).popupNode)
          },
        }))
      }

      if (!this.document.getElementById('better-bibtex-editpane-item-box')) {
        itemBoxInstance.parentNode.appendChild(elements.create('vbox', { flex: 1, margin: 0, padding: 0, $: [

          elements.create('grid', { id: 'better-bibtex-editpane-item-box', $: [
            elements.create('columns', { $: [
              elements.create('column'),
              elements.create('column'),
              // elements.create('column', { flex: 100 }),
            ]}),
            elements.create('rows', { id: 'better-bibtex-fields', flex: 1, $: [
              elements.create('row', { class: 'zotero-item-first-row', $: [
                elements.create('label', { id: 'better-bibtex-citekey-label', style: 'width: 9em; text-align: right; color: #7F7F7F', value: '' }),
                elements.create('textbox', { id: 'better-bibtex-citekey-display', class: 'plain', readonly: 'true', value: '' }),
                // elements.create('label', { id: 'better-bibtex-citekey-pin', value: icons.pin }),
              ]}),
            ]}),
          ]}),

          itemBoxInstance,
        ]}))
      }
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

      const { citekey, pinned } = Zotero.BetterBibTeX.KeyManager.get(this.item.id)
      const label = this.parentNode.querySelector('#better-bibtex-citekey-label')
      const value = this.parentNode.querySelector('#better-bibtex-citekey-display')
      if (!value) return // merge pane uses itembox

      label.hidden = value.hidden = !citekey

      label.value = `${pinned ? icons.pin : ''}${l10n.localize('better-bibtex_item-pane_citekey')}`
      value.value = citekey
    })
  }

  public unload(): void {
    if (Zotero.BetterBibTeX.KeyManager.keys && this.observer) {
      Zotero.BetterBibTeX.KeyManager.keys.removeListener(this.observer)
    }
    this.elements.remove()
  }
}
