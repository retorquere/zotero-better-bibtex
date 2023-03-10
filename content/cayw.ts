/* eslint-disable no-magic-numbers */
declare const XPCOMUtils: any

import { stringify } from './stringify'

import { Formatter } from './cayw/formatter'
import { TeXstudio } from './tex-studio'
import * as escape from './escape'
import { flash } from './flash'
import { log } from './logger'

Components.utils.import('resource://gre/modules/XPCOMUtils.jsm')

/* eslint-disable max-classes-per-file */

class FieldEnumerator {
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public QueryInterface = XPCOMUtils.generateQI([Components.interfaces.nsISupports, Components.interfaces.nsISimpleEnumerator])
  public doc: Document
  public idx: number

  constructor(doc) {
    this.doc = doc
    this.idx = 0
  }

  public hasMoreElements() { return this.idx < this.doc.fields.length }
  public getNext() { return this.doc.fields[this.idx++] }
}

/**
 * The Field class corresponds to a field containing an individual citation
 * or bibliography
 */
class Field {
  public noteIndex = 0
  public doc: Document
  public code: string
  public text: string
  public isRich: boolean
  public wrappedJSObject: Field

  constructor(doc) {
    this.doc = doc
    this.code = ''
    // This is actually required and current integration code depends on text being non-empty upon insertion.
    // insertBibliography will fail if there is no placeholder text.
    this.text = '{Placeholder}'
    this.wrappedJSObject = this
  }

  /**
   * Deletes this field and its contents.
   */
  public delete() { this.doc.fields.filter(field => field !== this) }

  /**
   * Removes this field, but maintains the field's contents.
   */
  public removeCode() { this.code = '' }

  /**
   * Selects this field.
   */
  public select() { return 0 }

  /**
   * Sets the text inside this field to a specified plain text string or pseudo-RTF formatted text
   * string.
   *
   * @param {String} text
   * @param {Boolean} isRich
   */
  public setText(text, isRich) {
    this.text = text
    this.isRich = isRich
  }

  /**
   * Gets the text inside this field, preferably with formatting, but potentially without
   *
   * @returns {String}
   */
  public getText() { return this.text }

  /**
   * Sets field's code
   *
   * @param {String} code
   */
  public setCode(code) { this.code = code }

  /**
   * Gets field's code.
   *
   * @returns {String}
   */
  public getCode() { return this.code }

  /**
   * Returns true if this field and the passed field are actually references to the same field.
   *
   * @param {Field} field
   * @returns {Boolean}
   */
  public equals(field) { return this === field }

  /**
   * This field's note index, if it is in a footnote or endnote; otherwise zero.
   *
   * @returns {Number}
   */
  public getNoteIndex() { return 0 }
}

type DocumentData = Record<string, any>

type Citation = {
  id: number
  locator: string
  suppressAuthor: boolean
  prefix: string
  suffix: string
  label: string
  citekey: string

  uri: string
  itemType: string
  title: string
}
/**
 * The Document class corresponds to a single word processing document.
 */
class Document {
  public fields: Field[] = []
  public data: DocumentData
  public id: number

  constructor(docId, options) {
    this.id = docId

    options.style = options.style || 'apa'
    const style = Zotero.Styles.get(`http://www.zotero.org/styles/${options.style}`) || Zotero.Styles.get(`http://juris-m.github.io/styles/${options.style}`) || Zotero.Styles.get(options.style)
    options.style = style ? style.url : 'http://www.zotero.org/styles/apa'

    const data = new Zotero.Integration.DocumentData()
    data.prefs = {
      noteType: 0,
      fieldType: 'Field',
      automaticJournalAbbreviations: true,
    }
    data.style = {styleID: options.style, locale: 'en-US', hasBibliography: true, bibliographyStyleHasBeenSet: true}
    data.sessionID = Zotero.Utilities.randomString(10) // eslint-disable-line no-magic-numbers
    this.data = (data.serialize() as DocumentData)
  }

  /**
   * Displays a dialog in the word processing application
   *
   * @param {String} dialogText
   * @param {Number} icon - one of the constants defined in integration.js for dialog icons
   * @param {Number} buttons - one of the constants defined in integration.js for dialog buttons
   * @returns {Number}
   * - Yes: 2, No: 1, Cancel: 0
   * - Yes: 1, No: 0
   * - Ok: 1, Cancel: 0
   * - Ok: 0
   */
  public displayAlert(_dialogText, _icon, _buttons) { return 0 }

  /**
   * Brings this document to the foreground (if necessary to return after displaying a dialog)
   */
  public activate() { return 0 }

  /**
   * Determines whether a field can be inserted at the current position.
   *
   * @param {String} fieldType
   * @returns {Boolean}
   */
  public canInsertField(_fieldType) { return true }

  /**
   * Returns the field in which the cursor resides, or NULL if none.
   *
   * @param {String} fieldType
   * @returns {Boolean}
   */
  public cursorInField(_fieldType) { return false }

  /**
   * Get document data property from the current document
   *
   * @returns {String}
   */
  public getDocumentData() { return this.data }

  /**
   * Set document data property
   *
   * @param {String} data
   */
  public setDocumentData(data) { this.data = data }

  /**
   * Inserts a field at the given position and initializes the field object.
   *
   * @param {String} fieldType
   * @param {Integer} noteType
   * @returns {Field}
   */
  public insertField(fieldType, noteType) {
    if (typeof noteType !== 'number') {
      throw new Error('noteType must be an integer')
    }
    const field = new Field(this)
    this.fields.push(field)
    return field
  }

  /**
   * Gets all fields present in the document.
   *
   * @param {String} fieldType
   * @returns {FieldEnumerator}
   */
  public getFields(_fieldType) { return new FieldEnumerator(this) }

  /**
   * Gets all fields present in the document. The observer will receive notifications for two
   * topics: "fields-progress", with the document as the subject and percent progress as data, and
   * "fields-available", with an nsISimpleEnumerator of fields as the subject and the length as
   * data
   *
   * @param {String} fieldType
   * @param {nsIObserver} observer
   */
  public getFieldsAsync(fieldType, observer) {
    observer.observe(this.getFields(fieldType), 'fields-available', null)
  }

  /**
   * Sets the bibliography style, overwriting the current values for this document
   */
  public setBibliographyStyle(_firstLineIndent, _bodyIndent, _lineSpacing, _entrySpacing, _tabStops, _tabStopsCount) { return 0 }

  /**
   * Converts all fields in a document to a different fieldType or noteType
   *
   * @params {FieldEnumerator} fields
   */
  public convert(_fields, _toFieldType, _toNoteType, _count) { return 0 }

  /**
   * Cleans up the document state and resumes processor for editing
   */
  public cleanup() { return 0 }

  /**
   * Informs the document processor that the operation is complete
   */
  public complete() { return 0 }

  /**
   * Gets the citation
   */
  public citation(): Citation[] {
    if (!this.fields[0] || !this.fields[0].code || !this.fields[0].code.startsWith('ITEM CSL_CITATION ')) return []

    const citationItems = JSON.parse(this.fields[0].code.replace(/ITEM CSL_CITATION /, '')).citationItems
    const items = (citationItems.map(item => ({
      id: item.id,
      locator: item.locator || '',
      suppressAuthor: !!item['suppress-author'],
      prefix: item.prefix || '',
      suffix: item.suffix || '',
      label: item.locator ? (item.label || 'page') : '',
      citekey: Zotero.BetterBibTeX.KeyManager.get(item.id).citekey,

      uri: Array.isArray(item.uri) ? item.uri[0] : undefined,
      itemType: item.itemData ? item.itemData.type : undefined,
      title: item.itemData ? item.itemData.title : undefined,
    } as Citation)) as Citation[])
    return items
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Application = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public primaryFieldType = 'Field'
  public secondaryFieldType = 'Bookmark'
  public fields: any[] = []

  private docs: { [key: number]: Document } = {}
  private docId = 0

  /**
   * Gets the active document.
   *
   * @returns {Document}
   */
  public getActiveDocument() { return this.docs[this.docId] }

  /**
   * Gets the document by some app-specific identifier.
   *
   * @param {String|Number} id
   */
  public getDocument(id) {
    return this.docs[id]
  }

  public QueryInterface() { return this }

  public createDocument(options) {
    this.docId += 1
    this.docs[this.docId] = new Document(this.docId, options)
    return this.docs[this.docId]
  }

  public closeDocument(doc) {
    delete this.docs[doc.id]
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function pick(options: any): Promise<string> {
  await Zotero.BetterBibTeX.ready

  try {
    const formatter = options.format || 'playground'
    if (!Formatter[formatter]) throw new Error(`No such formatter ${JSON.stringify(formatter)}`)
    const doc = Application.createDocument(options)
    await Zotero.Integration.execCommand('BetterBibTeX', 'addEditCitation', doc.id)

    const picked = doc.citation()
    Zotero.debug(`picking ${JSON.stringify(options)}`)
    const citation: string = picked.length ? await Formatter[formatter](picked, options) : ''
    Application.closeDocument(doc)

    if (options.select && picked.length) {
      const zoteroPane = Zotero.getActiveZoteroPane()
      zoteroPane.show()
      await zoteroPane.selectItems(picked.map(item => item.id), true)
    }

    return citation
  }
  catch (err) {
    log.error('CAYW error:', err)
    flash('CAYW Failed', stringify(err))
  }
}

async function selected(options): Promise<string> {
  const pane = Zotero.getActiveZoteroPane()
  const items = pane.getSelectedItems()
  const picked: Citation[] = items.map(item => ({
    id: item.id,
    locator: '',
    suppressAuthor: false,
    prefix: '',
    suffix: '',
    label: '',
    citekey: Zotero.BetterBibTeX.KeyManager.get(item.id).citekey,

    uri: undefined,
    itemType: undefined,
    title: item.getField('title'),
  }))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return picked.length ? await Formatter[options.format || 'playground'](picked, options) : ''
}

function toClipboard(text) {
  const data = {
    'text/unicode': text,
    'text/html': escape.html(text),
    'text/richtext': escape.rtf(text), // I know this is not the correct mimetype but it's the only one that Mozilla accepts for RTF
  }

  const clipboard = Components.classes['@mozilla.org/widget/clipboard;1'].getService(Components.interfaces.nsIClipboard)
  const transferable = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable)

  for (const [mimetype, content] of Object.entries(data)) {
    const str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString)
    str.data = content
    transferable.addDataFlavor(mimetype)
    transferable.setTransferData(mimetype, str, content.length * 2)
  }

  clipboard.setData(transferable, null, Components.interfaces.nsIClipboard.kGlobalClipboard)
}

Zotero.Server.Endpoints['/better-bibtex/cayw'] = class {
  public supportedMethods = ['GET']
  public OK = 200
  public SERVER_ERROR = 500

  public async init(request) {
    const options = request.query || {}

    if (options.probe) return [this.OK, 'text/plain', Zotero.BetterBibTeX.ready.isPending() ? 'starting' : 'ready' ]

    try {
      const citation = options.selected ? (await selected(options)) : (await pick(options))

      if (options.minimize) {
        const wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)
        const windows = wm.getEnumerator(null)
        while (windows.hasMoreElements()) {
          const win = windows.getNext().QueryInterface(Components.interfaces.nsIDOMChromeWindow)
          win.minimize()
        }
      }

      if (options.texstudio) {
        if (!TeXstudio.enabled) return [this.SERVER_ERROR, 'application/text', 'TeXstudio not found']
        await TeXstudio.push(citation)
      }

      if (options.clipboard) toClipboard(citation)

      return [this.OK, 'text/html; charset=utf-8', citation]
    }
    catch (err) {
      log.error('CAYW request failed:', options, err)
      flash('CAYW Failed', err.message)
      return [this.SERVER_ERROR, 'application/text', `CAYW failed: ${err.message}\n${err.stack}`]
    }
  }
}
