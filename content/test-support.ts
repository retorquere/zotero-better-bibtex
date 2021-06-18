declare const Zotero_File_Interface: any
declare const Zotero_Duplicates_Pane: any

import { AutoExport } from './auto-export'
import { sleep } from './sleep'
import * as ZoteroDB from './db/zotero'
import { log } from './logger'
import { Translators } from './translators'
import { Formatter as CAYWFormatter } from './cayw/formatter'
import { getItemsAsync } from './get-items-async'
import { AUXScanner } from './aux-scanner'
import { DB as Cache } from './db/cache'
import * as Extra from './extra'
import { $and } from './db/loki'
import  { defaults } from '../gen/preferences/meta'

export class TestSupport {
  public removeAutoExports(): void {
    AutoExport.db.findAndRemove({ type: { $ne: '' } })
  }

  public autoExportRunning(): boolean {
    return (AutoExport.db.find($and({ status: 'running' })).length > 0)
  }

  public async reset(): Promise<void> {
    Zotero.BetterBibTeX.localeDateOrder = Zotero.Date.getLocaleDateOrder()

    Cache.reset('test environment reset')

    let collections
    const prefix = 'translators.better-bibtex.'
    for (const [pref, value] of Object.entries(defaults)) {
      if (pref === 'testing') continue
      Zotero.Prefs.set(prefix + pref, value)
    }

    Zotero.Prefs.set(`${prefix}testing`, true)

    // remove collections before items to work around https://github.com/zotero/zotero/issues/1317 and https://github.com/zotero/zotero/issues/1314
    // ^%&^%@#&^% you can't just loop and erase because subcollections are also deleted
    while ((collections = Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID, true) || []).length) {
      await collections[0].eraseTx()
    }

    // Zotero DB access is *really* slow and times out even with chunked transactions. 3.5k references take ~ 50 seconds
    // to delete.
    let items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    while (items.length) {
      // eslint-disable-next-line no-magic-numbers
      const chunk = items.splice(0, 100)
      await Zotero.Items.erase(chunk)
    }

    await Zotero.Items.emptyTrash(Zotero.Libraries.userLibraryID)

    AutoExport.db.findAndRemove({ type: { $ne: '' } })


    items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    if (items.length !== 0) throw new Error('library not empty after reset')
  }

  public async librarySize(): Promise<number> {
    const itemIDs: number[] = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    return itemIDs.length
  }

  public async importFile(path: string, createNewCollection: boolean, preferences: Record<string, number | boolean | string>, localeDateOrder?: string): Promise<number> {
    if (localeDateOrder) Zotero.BetterBibTeX.localeDateOrder = localeDateOrder

    preferences = preferences || {}

    if (Object.keys(preferences).length) {
      for (let [pref, value] of Object.entries(preferences)) {
        if (typeof defaults[pref] === 'undefined') throw new Error(`Unsupported preference ${pref} in test case`)
        if (Array.isArray(value)) value = value.join(',')
        Zotero.Prefs.set(`translators.better-bibtex.${pref}`, value)
      }
    }
    else {
      log.debug(`importing references from ${path}`)
    }

    if (!path) return 0

    let items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    const before = items.length

    log.debug(`starting import at ${new Date()}`)

    if (path.endsWith('.aux')) {
      await AUXScanner.scan(path)
      // for some reason, the imported collection shows up as empty right after the import >:
      await sleep(1500) // eslint-disable-line no-magic-numbers
    }
    else {
      await Zotero_File_Interface.importFile({ file: Zotero.File.pathToFile(path), createNewCollection: !!createNewCollection })
    }
    log.debug(`import finished at ${new Date()}`)

    items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    const after = items.length

    log.debug(`import found ${after - before} items`)

    return (after - before)
  }

  public async exportLibrary(translatorID: string, displayOptions: Record<string, number | string | boolean>, path: string, collectionName: string): Promise<string> {
    let scope
    log.debug('TestSupport.exportLibrary', { translatorID, displayOptions, path, collectionName })
    if (collectionName) {
      let name = collectionName
      if (name[0] === '/') name = name.substring(1) // don't do full path parsing right now
      for (const collection of Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID)) {
        if (collection.name === name) scope = { type: 'collection', collection: collection.id }
      }
      log.debug('TestSupport.exportLibrary', { name, scope })
      if (!scope) throw new Error(`Collection '${name}' not found`)
    }
    else {
      scope = null
    }
    return await Translators.exportItems(translatorID, displayOptions, scope, path)
  }

  public async select(ids: number[]): Promise<boolean> {
    const zoteroPane = Zotero.getActiveZoteroPane()
    // zoteroPane.show()

    const sortedIDs = JSON.stringify(ids.slice().sort())
    // eslint-disable-next-line no-magic-numbers
    for (let attempt = 1; attempt <= 10; attempt++) {
      log.debug(`select ${ids}, attempt ${attempt}`)
      await zoteroPane.selectItems(ids, true)

      let selected
      try {
        selected = zoteroPane.getSelectedItems(true)
      }
      catch (err) { // zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
        log.error('Could not get selected items:', err)
        selected = []
      }

      log.debug('selected items = ', selected)

      if (sortedIDs === JSON.stringify(selected.sort())) return true
      log.debug(`select: expected ${ids}, got ${selected}`)
    }
    throw new Error(`failed to select ${ids}`)
  }

  public async find(query: { contains: string, is: string }, expected = 1): Promise<number[]> {
    if (!Object.keys(query).length) throw new Error(`empty query ${JSON.stringify(query)}`)

    let ids: number[] = []

    if (query.contains) ids = ids.concat(Zotero.BetterBibTeX.KeyManager.keys.where( (item: { citekey: string }) => item.citekey.toLowerCase().includes(query.contains.toLowerCase()) ).map((item: { itemID: number }) => item.itemID))
    if (query.is) ids = ids.concat(Zotero.BetterBibTeX.KeyManager.keys.find($and({ citekey: query.is })).map((item: { itemID: number }) => item.itemID))

    const s = new Zotero.Search()
    for (const [mode, text] of Object.entries(query)) {
      if (!['is', 'contains'].includes(mode)) throw new Error(`unsupported search mode ${mode}`)
      s.addCondition('field', mode, text)
    }
    ids = ids.concat(await s.search())
    ids = Array.from(new Set(ids))
    if (!ids || !ids.length) throw new Error(`No item found matching ${JSON.stringify(query)}`)
    if (ids.length !== expected) throw new Error(`${JSON.stringify(query)} matched ${JSON.stringify(ids)}, but only ${expected} expected`)

    return Array.from(new Set(ids))
  }

  public async pick(format: string, citations: {id: number[], uri: string, citekey: string}[]): Promise<string> {
    for (const citation of citations) {
      if (citation.id.length !== 1) throw new Error(`Expected 1 item, got ${citation.id.length}`)
      citation.citekey = Zotero.BetterBibTeX.KeyManager.get(citation.id[0]).citekey
      citation.uri = Zotero.URI.getItemURI(await getItemsAsync(citation.id[0]))
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await CAYWFormatter[format](citations, {})
  }

  public async pinCiteKey(itemID: number, action: string, citationKey?: string): Promise<void> {
    let ids: number[]
    if (typeof itemID === 'number') {
      ids = [itemID]
    }
    else {
      ids = []
      const items = await ZoteroDB.queryAsync(`
        SELECT item.itemID
        FROM items item
        JOIN itemTypes it ON item.itemTypeID = it.itemTypeID AND it.typeName NOT IN ('note', 'attachment', 'annotation')
        WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems)
      `)

      for (const item of items) {
        ids.push(item.itemID)
      }
    }

    if (!ids.length) throw new Error('Nothing to do')

    if (citationKey) {
      if (action !== 'pin') throw new Error(`Don't know how to ${action} ${citationKey}`)
      log.debug('conflict: pinning', ids, 'to', citationKey)
      for (const item of await getItemsAsync(ids)) {
        item.setField('extra', Extra.set(item.getField('extra'), { citationKey }))
        log.debug('conflict: extra set to', item.getField('extra'))
        await item.saveTx()
      }
      return
    }

    for (itemID of ids) {
      switch (action) {
        case 'pin':
          await Zotero.BetterBibTeX.KeyManager.pin(itemID)
          break
        case 'unpin':
          await Zotero.BetterBibTeX.KeyManager.unpin(itemID)
          break
        case 'refresh':
          await Zotero.BetterBibTeX.KeyManager.refresh(itemID)
          break
        default:
          throw new Error(`TestSupport.pinCiteKey: unsupported action ${action}`)
      }
    }
  }

  public resetCache(): void {
    Cache.reset('requested during test')
  }

  public async merge(ids: number[]): Promise<void> {
    const zoteroPane = Zotero.getActiveZoteroPane()
    await zoteroPane.selectItems(ids, true)
    const selected = zoteroPane.getSelectedItems()
    if (selected.length !== ids.length) throw new Error(`selected: ${selected.length}, expected: ${ids.length}`)

    // zoteroPane.mergeSelectedItems()

    if (typeof Zotero_Duplicates_Pane === 'undefined') {
      log.debug('Loading duplicatesMerge.js')
      Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader).loadSubScript('chrome://zotero/content/duplicatesMerge.js')
    }

    selected.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))

    Zotero_Duplicates_Pane.setItems(selected)
    await sleep(1500) // eslint-disable-line no-magic-numbers

    const before = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    await Zotero_Duplicates_Pane.merge()

    await sleep(1500) // eslint-disable-line no-magic-numbers
    const after = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    if (before.length - after.length !== (ids.length - 1)) throw new Error(`merging ${ids.length}: before = ${before.length}, after = ${after.length}`)
  }

  public async clearCollection(path: string): Promise<void> {
    let collection = null

    for (const name of path.split('/')) {
      const collections = collection ? Zotero.Collections.getByParent(collection.id) : Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID)
      let found = false
      for (const candidate of collections) {
        if (candidate.name !== name) continue

        collection = candidate
        found = true
        break
      }
      if (!found) throw new Error(`${path} not found`)
    }

    const itemIDs = collection.getChildItems(true)
    if (!itemIDs.length) throw new Error(`${path} is empty`)
    await Zotero.DB.executeTransaction(async () => {
      await collection.removeItems(itemIDs)
    })
    if (collection.getChildItems(true).length) throw new Error(`${path} not empty`)
  }
}
