import { patch as $patch$ } from './monkey-patch'
import { sentenceCase } from './text'
import * as l10n from './l10n'
import { Elements } from './create-element'
import { busyWait } from './busy-wait'
import { icons } from './icons'
import { Events } from './events'

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
  let itemBox: HTMLElement
  await busyWait(() => { itemBox = win.document.querySelector('#zotero-editpane-item-box'); return !!itemBox })
  new ZoteroItemPane(win, itemBox)
}

export class ZoteroItemPane {
  document: Document
  elements: Elements
  displayed: number
  done: () => void

  public refresh(): void {
    this.itemBox.refresh()
  }

  constructor(win: Window, private itemBox: any) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    this.document = win.document
    const elements = this.elements = new Elements(this.document)

    if (!this.document.getElementById('better-bibtex-editpane-item-box')) {
      itemBox.parentNode.appendChild(elements.create('vbox', { flex: 1, style: 'margin: 0; padding: 0', $: [

        elements.create('grid', { id: 'better-bibtex-editpane-item-box', $: [
          elements.create('columns', { $: [
            elements.create('column'),
            elements.create('column', { flex: '1' }),
            // elements.create('column', { flex: 100 }),
          ]}),
          elements.create('rows', { id: 'better-bibtex-fields', flex: 1, $: [
            elements.create('row', { class: 'zotero-item-first-row', $: [
              elements.create('label', { id: 'better-bibtex-citekey-label', style: 'width: 9em; text-align: right; color: #7F7F7F', value: '' }),
              elements.create('textbox', { id: 'better-bibtex-citekey-display', flex: '1', class: 'plain', readonly: 'true', value: '' }),
              // elements.create('label', { id: 'better-bibtex-citekey-pin', value: icons.pin }),
            ]}),
          ]}),
        ]}),

        itemBox,
      ]}))
    }

    win.addEventListener('unload', () => {
      this.unload()
    })

    const self = this // eslint-disable-line @typescript-eslint/no-this-alias
    $patch$(itemBox.__proto__, 'refresh', original => function() {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)

      if (!this.item) {
        // why is it refreshing if there is no item?!
        self.displayed = undefined
        return
      }

      self.displayed = this.item.id
      const menuid = 'zotero-field-transform-menu-better-sentencecase'
      let menuitem = this.ownerDocument.getElementById(menuid)
      const menu = this.ownerDocument.getElementById('zotero-field-transform-menu')
      if (menu && !menuitem) {
        menuitem = menu.appendChild(elements.create('menuitem', {
          id: menuid,
          label: 'BBT sentence case',
          oncommand: event => {
            title_sentenceCase.call(event.currentTarget.ownerDocument.getBindingParent(event.currentTarget), event.currentTarget.ownerDocument.popupNode)
          },
        }))
      }

      const { citationKey, pinned } = Zotero.BetterBibTeX.KeyManager.get(this.item.id)
      const label = this.parentNode.querySelector('#better-bibtex-citekey-label')
      const value = this.parentNode.querySelector('#better-bibtex-citekey-display')
      if (!value) return // merge pane uses itembox

      label.hidden = value.hidden = !citationKey

      label.value = `${ pinned ? icons.pin : '' }${ l10n.localize('better-bibtex_item-pane_info_citation-key.label') }`
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
  }
}
