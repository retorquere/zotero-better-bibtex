/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/only-throw-error, @typescript-eslint/require-await */

import { getItemsAsync } from './get-items-async'
import { AUXScanner } from './aux-scanner'
import { AutoExport } from './auto-export'
import { Translators } from './translators'
import { get as getCollection } from './collection'
import * as Library from './library'
import { log } from './logger'
import { Preference } from './prefs'
import { orchestrator } from './orchestrator'
import { Server } from './server'

import { version as BBTVersion } from '../gen/version.json'

import { methods } from '../gen/api/json-rpc'

const OK = 200

const PARSE_ERROR = -32700 // Invalid JSON was received by the server.
const INVALID_REQUEST = -32600 // The JSON sent is not a valid Request object.
const METHOD_NOT_FOUND = -32601 // The method does not exist / is not available.
const INVALID_PARAMETERS = -32602 // Invalid method parameter(s).
const INTERNAL_ERROR = -32603 // Internal JSON-RPC error.

type QueryPrimitive = number | boolean | string
type Query = Record<string, QueryPrimitive | Record<'in', QueryPrimitive[]>>

function getStyle(id: string): any {
  const style = Zotero.Styles.get(id)
  if (!style) throw new Error(`CSL style ${ JSON.stringify(id) } not found`)
  return style
}

export class NSCollection {
  /**
   * Scan an AUX file for citekeys and populate a Zotero collection from them. The target collection will be cleared if it exists.
   *
   * @param collection  The forward-slash separated path to the collection. The first part of the path must be the library name, or empty (`//`); empty is your personal library. Intermediate collections that do not exist will be created as needed.
   * @param aux         The absolute path to the AUX file on disk
   *
   */
  public async scanAUX(collection: string, aux: string): Promise<{ libraryID: number; key: string }> {
    const { libraryID, key } = await getCollection(collection, true)
    await AUXScanner.scan(aux, { collection: { libraryID, key, replace: true }})
    return { libraryID, key }
  }
}

export class NSAutoExport {
  /**
   * Add an auto-export for the given collection. The target collection will be created if it does not exist
   *
   * @param collection                             The forward-slash separated path to the collection. The first part of the path must be the library name, or empty (`//`); empty is your personal library. Intermediate collections that do not exist will be created as needed.
   * @param translator                             The name or GUID of a BBT translator
   * @param path                                   The absolute path to which the collection will be auto-exported
   * @param displayOptions                         Options which you would be able to select during an interactive export; `exportNotes`, default `false`, and `useJournalAbbreviation`, default `false`
   * @param replace                                Replace the auto-export if it exists, default `false`
   * @returns                                      Collection ID of the target collection
   */
  public async add(collection: string, translator: string, path: string, displayOptions: Record<string, boolean> = {}, replace = false): Promise<{ libraryID: number; key: string; id: number }> {
    const translatorID = Translators.getTranslatorId(translator)
    if (!Translators.byId[translatorID]) throw { code: INVALID_PARAMETERS, message: `Unknown translator '${ translator }'` }

    const coll = await getCollection(collection, true)

    const ae = AutoExport.get(path)
    if (ae && ae.translatorID === translatorID && ae.type === 'collection' && ae.id === coll.id) {
      AutoExport.schedule(ae.type, [ae.id])
    }
    else if (ae && !replace) {
      throw { code: INVALID_PARAMETERS, message: 'Auto-export exists with incompatible parameters, but no \'replace\' was requested' }
    }
    else {
      await AutoExport.add({
        enabled: true,
        type: 'collection',
        id: coll.id,
        path,
        status: 'done',
        recursive: false,
        updated: Date.now(),
        error: '',
        translatorID,
        exportNotes: displayOptions.exportNotes,
        useJournalAbbreviation: displayOptions.useJournalAbbreviation,
      }, true)
    }

    return { libraryID: coll.libraryID, key: coll.key, id: coll.id }
  }
}

export class NSUser {
  /**
   * List the libraries (also known as groups) the user has in Zotero
   *
   * @param includeCollections Wether or not the result should inlcude a list of collection for each library (default is false)
   */
  public async groups(includeCollections?: boolean): Promise<{ id: number; name: string; collections: any[] }[]> {
    return Zotero.Libraries
      .getAll().map(lib => ({
        id: lib.libraryID,
        name: lib.name,
        collections: includeCollections ? Zotero.Collections.getByLibrary(lib.libraryID, true) : undefined,
      }))
  }
}

function getLibrary(term: string | number): number {
  return Library.get({ libraryID: term, group: term }, true).libraryID
}

export class NSItem {
  /**
   * Search for items in Zotero.
   *
   * Examples
   *
   * - search('') or search([]): return every entries
   * - search('Zotero'): quick search for 'Zotero'
   * - search([['title', 'contains', 'Zotero']]): search for 'Zotero' in the Title
   * - search([['library', 'is', 'My Library']]): search for entries in 'My Library'
   *   (this function try to resolve the string 'My Library' into is own libraryId number)
   * - search([['ignore_feeds']]): custom action for ignoring the feeds
   * - search([['ignore_feeds'], ['quicksearch-titleCreatorYear', 'contains', 'Zotero']]): quick search for 'Zotero' ignoring the Feeds
   * - search([['creator', 'contains', 'Johnny'], ['title', 'contains', 'Zotero']]): search for entries with Creator 'Johnny' AND Title 'Zotero'
   * - search([['joinMode', 'any'], ['creator', 'contains', 'Johnny'], ['title', 'contains', 'Zotero']]): search for entries with Creator 'Johnny' OR Title 'Zotero'
   * - search([['joinMode', 'any'], ['creator', 'contains', 'Johnny'], ['title', 'contains', 'Zotero'], ['creator', 'contains', 'Smith', true]]): search for entries with (Creator 'Johnny' OR Title 'Zotero') AND (Creator 'Smith')
   *
   * @param terms  Single string as typed into the search box in Zotero (search for Title Creator Year)
   *               Array of tuples similar as typed into the advanced search box in Zotero
   *               (https://github.com/zotero/zotero/blob/9971f15e617f19f1bc72f8b24bb00b72d2a4736f/chrome/content/zotero/xpcom/data/searchConditions.js#L72-L610)
   */
  public async search(
    terms: string | ([string] | [string, string] | [string, string, string | number] | [string, string, string | number, boolean])[],
    library?: string | number
  ): Promise<any> {
    const search = (new Zotero.Search)

    if (!terms.length) { /* */ }
    else if (typeof terms === 'string') {
      // Custom action for only string.
      // Similar behavior as quicksearch-titleCreateorYear, but search also in citationKey and ignore feeds and attachments

      // Credit #2740
      const fields = [
        // search the quicksearch-titleCreatorYear fields
        'title',
        'publicationTitle',
        'shortTitle',
        'court',
        'year',

        // plus the citationKey
        'citationKey',
      ]

      search.addCondition('blockStart')
      for (const field of fields) {
        search.addCondition(field, 'contains', terms, false)
      }
      search.addCondition('blockEnd')

      // Ignore Feeds
      for (const feed of Zotero.Feeds.getAll()) {
        search.addCondition('libraryID', 'isNot', feed.libraryID, true)
      }

      // Do not list attachments
      search.addCondition('itemType', 'isNot', 'attachment', true)

      if (typeof library !== 'undefined' && library !== '*') {
        try {
          search.addCondition('libraryID', 'is', getLibrary(library), true)
        }
        catch {
          throw new Error(`library ${ JSON.stringify(library) } not found`)
        }
      }
    }
    else {
      blk: for (const term of terms) {
        // Custom Actions
        if ((term.length === 1)) {
          switch (term[0]) {
            case 'ignore_feeds': {
              for (const feed of Zotero.Feeds.getAll()) {
                search.addCondition('libraryID', 'isNot', feed.libraryID, true)
              }
              continue blk
            }
          }
        }
        // libraryId can be provided as Library Name
        else if ((term.length >= 3) && (term[0] === 'libraryID')) {
          try {
            term[2] = getLibrary(term[2])
          }
          catch {
            throw new Error(`library ${ JSON.stringify(term[2]) } not found`)
          }
        }
        // @ts-expect-error I don't know why this spread fails type checking
        search.addCondition(...term)
      }
    }

    const ids = new Set(await search.search())

    const items = await getItemsAsync(Array.from(ids))
    const libraries = {}

    return items.map(item => {
      if (!libraries[item.libraryID]) {
        const lib = Zotero.Libraries.get(item.libraryID)
        libraries[item.libraryID] = lib ? lib.name : `library#${item.libraryID}`
      }

      return {
        ...Zotero.Utilities.Item.itemToCSLJSON(item),
        library: libraries[item.libraryID],
        citekey: Zotero.BetterBibTeX.KeyManager.get(item.id).citationKey,
      }
    })
  }

  /**
   * List attachments for an item with the given citekey
   *
   * @param citekey  The citekey to search for
   * @param library  The libraryID to search in (optional). Pass `*` to search across your library and all groups.
   */
  public async attachments(citekey: string, library?: string | number): Promise<any> {
    const where: Query = { citationKey: citekey.replace(/^@/, '') }
    if (library !== '*') where.libraryID = getLibrary(library)
    const key = Zotero.BetterBibTeX.KeyManager.first({ where })
    if (!key) throw { code: INVALID_PARAMETERS, message: `${ citekey } not found` }
    const item = await getItemsAsync(key.itemID)
    const attachments = await getItemsAsync(item.getAttachments())
    const output: Record<string, any>[] = []

    for (const att of attachments) {
      const data: Record<string, any> = {
        open: `zotero://open-pdf/${Zotero.API.getLibraryPrefix(item.libraryID || Zotero.Libraries.userLibraryID)}/items/${att.key}`,
        path: att.getFilePath(),
      }

      if (att.isFileAttachment()) {
        const rawAnnotations = att.getAnnotations()

        if (rawAnnotations.length) {
          const annotations: Record<string, any>[] = []

          for (const raw of rawAnnotations) {
            const annot = raw.toJSON()

            if (annot.annotationType === 'image') {
              if (!await Zotero.Annotations.hasCacheImage(raw)) {
                await Zotero.PDFWorker.renderAttachmentAnnotations(raw.parentID)
              }
              annot.annotationImagePath = Zotero.Annotations.getCacheImagePath(raw)
            }

            if (annot.annotationPosition && typeof annot.annotationPosition === 'string') {
              annot.annotationPosition = JSON.parse(annot.annotationPosition)
            }

            annotations.push(annot)
          }

          data.annotations = annotations
        }
      }

      output.push(data)
    }

    return output
  }

  /**
   * Fetch the collections containing a range of citekeys
   *
   * @param citekeys An array of citekeys
   * @param includeParents Include all parent collections back to the library root
   */
  public async collections(citekeys: string[], includeParents?: boolean): Promise<Record<string, { key: string; name: string }>> {
    citekeys = citekeys.map(citekey => citekey.replace('@', ''))
    const q: Query = {}
    if (Preference.citekeyCaseInsensitive) {
      q.lcCitationKey = { in: citekeys.map(citekey => citekey.toLowerCase()) }
    }
    else {
      q.citationKey = { in: citekeys }
    }
    const keys = Zotero.BetterBibTeX.KeyManager.find({ where: q })
    if (!keys.length) throw { code: INVALID_PARAMETERS, message: `zero matches for ${ citekeys.join(',') }` }

    const seen: Record<string, any> = {}
    const recurseParents = (libraryID: number, key: string): string => {
      if (!seen[key]) {
        let col = (Zotero.Collections.getByLibraryAndKey(libraryID, key) || null)?.toJSON()

        if (col) {
          col = structuredClone(col)
        }
        else {
          return ''
        }

        if (col.parentCollection) {
          col.parentCollection = recurseParents(libraryID, col.parentCollection)
        }

        delete col.relations
        delete col.version

        seen[key] = col
      }

      return seen[key]
    }

    const collections = {}
    for (const key of keys) {
      const item = await getItemsAsync(key.itemID)
      collections[key.citationKey] = item.getCollections().map(id => {
        const col = structuredClone(Zotero.Collections.get(id).toJSON())

        delete col.relations
        delete col.version

        seen[id] = col

        if (includeParents && col.parentCollection) {
          col.parentCollection = recurseParents(item.libraryID, col.parentCollection)
        }

        return col
      })
    }

    return collections
  }

  /**
   * Fetch the notes for a range of citekeys
   *
   * @param citekeys An array of citekeys
   */
  public async notes(citekeys: string[]): Promise<Record<string, { note: string }[]>> {
    citekeys = citekeys.map(citekey => citekey.replace('@', ''))
    const q = { where: {}}
    if (Preference.citekeyCaseInsensitive) {
      q.where = { lcCitationKey: { in: citekeys.map(citekey => citekey.toLowerCase()) }}
    }
    else {
      q.where = { citationKey: { in: citekeys }}
    }
    const keys = Zotero.BetterBibTeX.KeyManager.find(q)
    if (!keys.length) throw { code: INVALID_PARAMETERS, message: `zero matches for ${ citekeys.join(',') }` }

    const notes = {}
    for (const key of keys) {
      const item = await getItemsAsync(key.itemID)
      notes[key.citationKey] = (await getItemsAsync(item.getNotes())).map(note => note.getNote())
    }
    return notes
  }

  /**
   * Generate a bibliography for the given citekeys
   *
   * @param citekeys An array of citekeys
   * @param {object} format   A specification of how the bibliography should be formatted
   * @param {string} format.quickCopy    Format as specified in the Zotero quick-copy settings
   * @param {} format.contentType  Output as HTML or text
   * @param {} format.locale       Locale to use to generate the bibliography
   * @param {} format.id           CSL style to use
   *
   * @returns  A formatted bibliography
   */
  public async bibliography(citekeys: string[], format: { quickCopy?: boolean; contentType?: 'html' | 'text'; locale?: string; id?: string } = {}, library?: string | number): Promise<string> {
    const qc = format.quickCopy ? Zotero.QuickCopy.unserializeSetting(Zotero.Prefs.get('export.quickCopy.setting')) : {}
    delete format.quickCopy

    format = {
      contentType: 'text', // can be 'html'
      locale: '',
      id: '',
      ...qc,
      ...format,
    }

    if (!format.id) throw new Error('no style specified')
    if (!format.id.includes('/')) format.id = `http://www.zotero.org/styles/${ format.id }`
    getStyle(format.id)

    if (((format as any).mode || 'bibliography') !== 'bibliography') throw new Error(`mode must be bibliograpy, not ${ (format as any).mode }`)

    const where: Query = {}
    if (library !== '*') where.libraryID = getLibrary(library)
    citekeys = citekeys.map(citekey => citekey.replace('@', ''))
    if (Preference.citekeyCaseInsensitive) {
      where.lcCitationKey = { in: citekeys.map(citekey => citekey.toLowerCase()) }
    }
    else {
      where.citationKey = { in: citekeys }
    }

    const items = await getItemsAsync(Zotero.BetterBibTeX.KeyManager.find({ where }).map(key => key.itemID))

    const bibliography = Zotero.QuickCopy.getContentFromItems(items, { ...format, mode: 'bibliography' }, null, false)
    return bibliography[format.contentType || 'html']
  }

  /**
   * Fetch citationkeys given item keys
   *
   * @param item_keys  A list of [libraryID]:[itemKey] strings. If [libraryID] is omitted, assume 'My Library'
   */
  public async citationkey(item_keys: string[] | 'selected'): Promise<Record<string, string>> {
    const keys = {}

    if (item_keys === 'selected') {
      for (const item of Zotero.getActiveZoteroPane().getSelectedItems()) {
        if (item.isFeedItem) continue
        if (item.isRegularItem()) {
          keys[item.key] = Zotero.BetterBibTeX.KeyManager.first({ where: { libraryID: item.libraryID, itemKey: item.key }})?.citationKey || null
        }
        else if (item.isAttachment() && typeof item.parentID === 'number') {
          keys[item.key] = Zotero.BetterBibTeX.KeyManager.first({ where: { libraryID: item.libraryID, itemID: item.parentID }})?.citationKey || null
        }
      }
      return keys
    }

    let libraryIDstr: string
    let libraryID: number
    let itemKey: string

    for (const key of item_keys) {
      if (key.includes(':')) {
        [ libraryIDstr, itemKey ] = key.split(':')
        libraryID = parseInt(libraryIDstr)
        if (isNaN(libraryID)) throw new Error(`Could not parse library ID from ${ key }`)
      }
      else {
        libraryID = Zotero.Libraries.userLibraryID
        itemKey = key
      }

      keys[key] = Zotero.BetterBibTeX.KeyManager.first({ where: { libraryID, itemKey }})?.citationKey || null
    }

    return keys
  }

  /**
   * Generate an export for a list of citekeys
   *
   * @param citekeys      Array of citekeys
   * @param translator    BBT translator name or GUID
   * @param libraryID     ID of library to select the items from. When omitted, assume 'My Library'
   */
  public async export(citekeys: string[], translator: string, libraryID?: string | number): Promise<string> {
    const where: Query = {
      libraryID: getLibrary(libraryID),
    }
    citekeys = citekeys.map(citekey => citekey.replace('@', ''))
    if (Preference.citekeyCaseInsensitive) {
      where.lcCitationKey = { in: citekeys.map(citekey => citekey.toLowerCase()) }
    }
    else {
      where.citationKey = { in: citekeys }
    }

    const found = Zotero.BetterBibTeX.KeyManager.find({ where })

    const status: Record<string, number> = {}
    for (const citekey of citekeys) {
      status[citekey] = 0
    }
    for (const item of found) {
      status[item.citationKey] += 1
    }
    const error = { missing: [], duplicates: []}
    for (const [ citekey, n ] of Object.entries(status)) {
      switch (n) {
        case 0:
          error.missing.push(citekey)
          break
        case 1:
          break
        default:
          error.duplicates.push(citekey)
          break
      }
    }

    if (error.missing.length || error.duplicates.length) {
      const message = [
        error.missing.length ? `not found: ${ error.missing.join(', ') }` : '',
        error.duplicates.length ? `duplicates found: ${ error.duplicates.join(', ') }` : '',
      ].filter(msg => msg).join('\n')
      throw { code: INVALID_PARAMETERS, message }
    }

    return await Translators.queueJob({
      translatorID: Translators.getTranslatorId(translator),
      displayOptions: { worker: true },
      scope: { type: 'items', items: await getItemsAsync(found.map(key => key.itemID)) },
    })
  }

  /**
   * Generate an export for a list of citekeys, tailored for the pandoc zotero filter
   *
   * @param citekeys      Array of citekeys
   * @param asCSL         Return the items as CSL
   * @param libraryID     ID of library to select the items from. When omitted, assume 'My Library'
   */
  public async pandoc_filter(citekeys: string[], asCSL: boolean, libraryID?: string | number | string[], style?: string, locale?: string): Promise<any> {
    citekeys = [...(new Set(citekeys))]
    const ci = Preference.citekeyCaseInsensitive
    const result: { errors: Record<string, number>; items: Record<string, any> } = { errors: {}, items: {}}

    const where: Query = {
      libraryID: Array.isArray(libraryID)
        ? { in: libraryID.map(name => getLibrary(name)) }
        : getLibrary(libraryID),
    }
    const itemIDs: number[] = []
    for (const citationKey of citekeys.map(citekey => citekey.replace('@', ''))) {
      where[ci ? 'lcCitationKey' : 'citationKey'] = ci ? citationKey.toLowerCase() : citationKey
      const found = Zotero.BetterBibTeX.KeyManager.find({ where })
      if (found.length === 1) {
        itemIDs.push(found[0].itemID)
      }
      else {
        result.errors[citationKey] = found.length
      }
    }

    if (!itemIDs.length) return result

    const items = await getItemsAsync(itemIDs)

    if (asCSL) {
      // I need the cleanup BCJ does
      const csl = JSON.parse(await Translators.queueJob({
        translatorID: Translators.getTranslatorId('Better CSL JSON'),
        displayOptions: { worker: true, custom: true },
        scope: { type: 'items', items },
      }))

      style = style || 'apa'
      if (!style.includes('/')) style = `http://www.zotero.org/styles/${ style }`
      locale = locale || Zotero.Prefs.get('export.quickCopy.locale') as string
      const citeproc = getStyle(style).getCiteProc(locale)

      for (const item of csl) {
        result.items[item['citation-key']] = item

        let [ authorDate, date ] = [ false, true ].map(suppress => {
          citeproc.updateItems([item.custom.itemID])
          const citation = {
            citationItems: [{ id: item.custom.itemID, 'suppress-author': suppress }],
            properties: {},
          }
          return citeproc.previewCitationCluster(citation, [], [], 'text') as string
        })

        while (authorDate.length && date.length && authorDate[0] === date[0] && !authorDate.endsWith(date)) {
          authorDate = authorDate.slice(1)
          date = date.slice(1)
        }

        if (authorDate.endsWith(date)) {
          item.custom.author = authorDate.replace(date, '').replace(/\s*,\s*$/, '')
        }
        else {
          item.custom.author = items.find(i => i.id === item.custom.itemID)?.getField('firstCreator')
          item.custom.author = item.custom.author || [ 'author', 'creators', 'reporter' ]
            .map(cr => item[cr] as { literal: string; family: string } [])
            .find(cr => cr)
            ?.map(cr => cr.literal || cr.family)
            .filter(cr => cr)
            .join(', ')
            .replace(/(, )(?!.*\1)/, ' and ')
          item.custom.author = item.custom.author || ''
        }
      }

      citeproc.free()
    }
    else {
      for (const item of items.map(i => Zotero.Utilities.Internal.itemToExportFormat(i, false, true))) {
        result.items[item.citationKey] = item
      }
    }

    return result
  }
}

export class NSViewer {
  /**
   * Open the PDF associated with an entry with a given id.
   * the id can be retrieve with e.g. item.search("mypdf") -> result[0].id
   *
   * @param id      id in the form of http://zotero.org/users/12345678/items/ABCDEFG0
   * @param page    Page Number, counting from zero
   */
  public async viewPDF(id: string, page: number): Promise<void> {
    const item = await Zotero.URI.getURIItem(id)
    if (!item) throw { code: INVALID_PARAMETERS, message: `invalid URI ${ id }` }
    let attachments = await item.getBestAttachments()

    attachments = attachments.filter(x => x.isPDFAttachment())

    if (!attachments.length) throw { code: INVALID_PARAMETERS, message: `no PDF found for URI ${ id }` }
    return await Zotero.OpenPDF.openToPage(attachments[0], page + 1)
  }
}

export class NSAPI {
  /**
   * Returns the Zotero and BetterBibTeX version to show the JSON-RPC API is ready.
   */
  public async ready(): Promise<{ zotero: string; betterbibtex: string }> {
    return { zotero: Zotero.version, betterbibtex: BBTVersion }
  }
}

const api = new class API {
  public $user = new NSUser
  public $item = new NSItem
  public $items: NSItem
  public $collection = new NSCollection
  public $autoexport = new NSAutoExport
  public $viewer = new NSViewer
  public $api = new NSAPI

  constructor() {
    this.$items = this.$item
  }

  private invalid(message) {
    return {
      jsonrpc: '2.0',
      error: {
        code: INVALID_PARAMETERS,
        message,
      },
      id: null,
    }
  }
  public async handle(request) {
    if (!this.validRequest(request)) return { jsonrpc: '2.0', error: { code: INVALID_REQUEST, message: 'Invalid Request' }, id: null }

    const [ namespace, methodName ] = request.method.split('.')
    const method = this[`$${ namespace }`]?.[methodName]
    if (!method) return { jsonrpc: '2.0', error: { code: METHOD_NOT_FOUND, message: `Method not found: ${ request.method }` }, id: null }
    const schema = methods[request.method]
    if (!schema) return { jsonrpc: '2.0', error: { code: METHOD_NOT_FOUND, message: `Method schema not found: ${ request.method }` }, id: null }

    if (!request.params) request.params = []
    if (!Array.isArray(request.params)) {
      const params = request.params
      request.params = schema.parameters.map(_ => undefined)
      for (const [k, v] of Object.entries(params)) {
        const i = schema.parameters.indexOf(k)
        if (i < 0) return this.invalid(`unsupported argument ${k} for ${method}`)
        request.params[i] = v
      }
    }

    const errors = schema.parameters.map((p, i) => {
      const v = request.params[i]
      if (schema.required.includes(p) && typeof v === 'undefined') return `required argument ${p} missing`
      if (typeof v === 'undefined') return
      if (!schema.validate[p](v)) return schema.validate[p].errors as string[]
    }).filter((_?: string[]) => _) as string[][]
    if (errors.length) return this.invalid(JSON.stringify(errors))

    try {
      return { jsonrpc: '2.0', result: await method(...request.params), id: request.id || null }
    }
    catch (err) {
      log.error('JSON-RPC:', err)
      if (err.code) {
        return { jsonrpc: '2.0', error: { code: err.code, message: err.message }, id: null }
      }
      else {
        return { jsonrpc: '2.0', error: { code: INTERNAL_ERROR, message: `${ err }` }, id: null }
      }
    }
  }

  private validRequest(req) {
    if (typeof req !== 'object') return false
    if (req.jsonrpc !== '2.0') return false
    if (typeof req.method !== 'string') return false
    return true
  }
}

class Handler {
  public supportedMethods = [ 'GET', 'POST' ]
  public supportedDataTypes = ['application/json']
  public permitBookmarklet = false

  public async init(request) {
    const query = Server.queryParams(request)
    await Zotero.BetterBibTeX.ready

    try {
      if (request.method === 'GET') request.data = JSON.parse(query[''])

      const response = await (Array.isArray(request.data) ? Promise.all(request.data.map(req => api.handle(req))) : api.handle(request.data))
      return [ OK, 'application/json', JSON.stringify(response) ]
    }
    catch (err) {
      return [ OK, 'application/json', JSON.stringify({ jsonrpc: '2.0', error: { code: PARSE_ERROR, message: `Parse error: ${ err } in ${ request.data }` }, id: null }) ]
    }
  }
}

orchestrator.add({
  id: 'json-rpc',
  description: 'JSON-RPC endpoint',
  needs: ['translators'],

  startup: async () => {
    Server.register('/better-bibtex/json-rpc', Handler)
    Server.startup()
  },

  shutdown: async () => {
    Server.shutdown()
  },
})
