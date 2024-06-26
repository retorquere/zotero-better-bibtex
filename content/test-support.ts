import { AutoExport } from './auto-export'
import * as ZoteroDB from './db/zotero'
import { log } from './logger'
import { Translators } from './translators'
import { Formatter as CAYWFormatter } from './cayw/formatter'
import { getItemsAsync } from './get-items-async'
import { AUXScanner } from './aux-scanner'
import { DB as Cache } from './db/cache'
import * as Extra from './extra'
import  { defaults } from '../gen/preferences/meta'
import { Preference } from './prefs'
import * as memory from './memory'
import { Events } from './events'
import { is7 } from './client'

const setatstart: string[] = ['testing', 'cache'].filter(p => Preference[p] !== defaults[p])

export class TestSupport {
  public timedMemoryLog: any
  public scenario: string

  /* REVIEW:
  public startTimedMemoryLog(msecs: number): void {
    if (typeof this.timedMemoryLog === 'undefined') {
      this.timedMemoryLog = setInterval(() => { log.debug('memory use:', memory.state('periodic snapshot')) }, msecs)
    }
  }
  */

  public isIdle(topic: string): boolean {
    return Events.idle[topic] === 'idle'
  }

  public memoryState(snapshot: string): memory.State {
    const state = memory.state(snapshot)
    return state
  }

  public async autoExportRunning(): Promise<number> {
    return await Zotero.DB.valueQueryAsync("SELECT COUNT(*) FROM betterbibtex.autoExport WHERE status = 'running'") as number
  }

  public async reset(scenario: string): Promise<void> {
    log.debug('test environment reset for', scenario)
    Cache.reset('test environment reset')

    const prefix = 'translators.better-bibtex.'
    for (const [pref, value] of Object.entries(defaults)) {
      if (setatstart.includes(pref)) continue
      Zotero.Prefs.set(prefix + pref, value)
    }

    Zotero.Prefs.set(`${prefix}testing`, true)

    // Zotero DB access is *really* slow and times out even with chunked transactions. 3.5k items take ~ 50 seconds
    // to delete.
    let items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    while (items.length) {
      const chunk = items.splice(0, 100)
      await Zotero.Items.erase(chunk)
    }
    await Zotero.Items.emptyTrash(Zotero.Libraries.userLibraryID)

    // for (const collection of (Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID, true) || [])) {
    //   await collection.eraseTx()
    // }
    // collections might erase their contained collections
    let collections
    while ((collections = Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID, true) || []).length) {
      await collections[0].eraseTx()
    }

    await AutoExport.removeAll()

    items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    if (items.length !== 0) throw new Error('library not empty after reset')

    await Zotero.Promise.delay(1000)

    await Zotero.DB.executeTransaction(async () => {
      Zotero.Prefs.set('purge.tags', true)
      await Zotero.Tags.purge()
    })

    if (Zotero.BetterBibTeX.KeyManager.all().length !== 0) throw new Error(`keystore has ${Zotero.BetterBibTeX.KeyManager.all().length} entries after reset`)
  }

  public async librarySize(): Promise<number> {
    const itemIDs: number[] = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    return itemIDs.length
  }

  public async importFile(path: string, createNewCollection: boolean, preferences: Record<string, number | boolean | string>): Promise<number> {
    preferences = preferences || {}

    for (let [pref, value] of Object.entries(preferences)) {
      if (pref === 'texmap') continue
      if (typeof defaults[pref] === 'undefined') throw new Error(`Unsupported preference ${pref} in test case`)
      if (Array.isArray(value)) value = value.join(',')
      Zotero.Prefs.set(`translators.better-bibtex.${pref}`, value)
    }

    if (!path) return 0

    let items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    const before = items.length

    if (path.endsWith('.aux')) {
      await AUXScanner.scan(path)
      // for some reason, the imported collection shows up as empty right after the import >:
      await Zotero.Promise.delay(1500)
    }
    else {
      await Zotero.getMainWindow().Zotero_File_Interface.importFile({ file: Zotero.File.pathToFile(path), createNewCollection: !!createNewCollection })
    }

    items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    const after = items.length

    await Zotero.Promise.delay(Zotero.Prefs.get('translators.better-bibtex.itemObserverDelay') * 3)
    return (after - before)
  }

  public async exportLibrary(translatorID: string, displayOptions: Record<string, number | string | boolean>, path: string, collectionName: string): Promise<string> {
    let scope
    if (collectionName) {
      let name = collectionName
      if (name[0] === '/') name = name.substring(1) // don't do full path parsing right now
      for (const collection of Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID)) {
        if (collection.name === name) scope = { type: 'collection', collection: collection.id }
      }
      if (!scope) throw new Error(`Collection '${name}' not found`)
    }
    else {
      scope = null
    }
    return await Translators.exportItems({translatorID, displayOptions: displayOptions as Record<string, boolean>, scope, path})
  }

  public async select(ids: number[]): Promise<boolean> {
    const zoteroPane = Zotero.getActiveZoteroPane()
    // zoteroPane.show()

    const sortedIDs = JSON.stringify(ids.slice().sort())
    for (let attempt = 1; attempt <= 10; attempt++) {
      await zoteroPane.selectItems(ids, true)

      let selected
      try {
        selected = zoteroPane.getSelectedItems(true)
      }
      catch (err) { // zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
        log.error('Could not get selected items:', err)
        selected = []
      }

      if (sortedIDs === JSON.stringify(selected.sort())) return true
    }
    throw new Error(`failed to select ${ids}`)
  }

  public async find(query: { contains: string, is: string }, expected = 1): Promise<number[]> {
    if (!Object.keys(query).length) throw new Error(`empty query ${JSON.stringify(query)}`)

    let ids: number[] = []

    if (query.contains) ids = ids.concat(Zotero.BetterBibTeX.KeyManager.all().filter(key => key.citationKey.toLowerCase().includes(query.contains.toLowerCase())).map(key => key.itemID))
    if (query.is) ids = ids.concat(Zotero.BetterBibTeX.KeyManager.find({ where: { citationKey: query.is } }).map(key => key.itemID))

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

  public async pick(format: string, citations: {id: number[], uri: string, citationKey: string}[]): Promise<string> {
    for (const citation of citations) {
      if (citation.id.length !== 1) throw new Error(`Expected 1 item, got ${citation.id.length}`)
      citation.citationKey = Zotero.BetterBibTeX.KeyManager.get(citation.id[0]).citationKey
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
      log.error('conflict: pinning', ids, 'to', citationKey)
      for (const item of await getItemsAsync(ids)) {
        item.setField('extra', Extra.set(item.getField('extra'), { citationKey }))
        log.error('conflict: extra set to', item.getField('extra'))
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
    const before = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)

    if (is7) {
      let other = await getItemsAsync(ids)
      const master = other.find(item => item.id === ids[0])
      other = other.filter(item => item.id !== ids[0])
      const json = master.toJSON()
      // Exclude certain properties that are empty in the cloned object, so we don't clobber them
      const { relations: _r, collections: _c, tags: _t, ...keep } = master.clone().toJSON() // eslint-disable-line @typescript-eslint/no-unused-vars
      Object.assign(json, keep)

      master.fromJSON(json)
      Zotero.Items.merge(master, other)
    }
    else {
      const zoteroPane = Zotero.getActiveZoteroPane()
      await zoteroPane.selectItems(ids, true)
      const selected = zoteroPane.getSelectedItems()
      if (selected.length !== ids.length) throw new Error(`selected: ${selected.length}, expected: ${ids.length}`)

      // zoteroPane.mergeSelectedItems()

      selected.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))

      const win = Zotero.getMainWindow()

      if (!win.Zotero_Duplicates_Pane) {
        Components.classes['@mozilla.org/moz/jssubscript-loader;1']
          .getService(Components.interfaces.mozIJSSubScriptLoader)
          .loadSubScript('chrome://zotero/content/duplicatesMerge.js', win)
      }

      win.Zotero_Duplicates_Pane.setItems(selected)
      await Zotero.Promise.delay(1500)
      await win.Zotero_Duplicates_Pane.merge()
    }

    await Zotero.Promise.delay(1500)

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

  public async quickCopy(itemIDs: number[], translator: string): Promise<string> {
    const format = {
      mode: 'export',
      contentType: '',
      id: Translators.byLabel[translator]?.translatorID || translator,
      locale: '',
    }

    return new Promise((resolve, reject) => {
      Zotero.QuickCopy.getContentFromItems(Zotero.Items.get(itemIDs), format, (obj, worked) => {
        if (worked) {
          resolve(obj.string.replace(/\r\n/g, '\n'))
        }
        else {
          reject(new Error(Zotero.getString('fileInterface.exportError')))
        }
      })
    })
  }

  public async editAutoExport(field: string, value: boolean | string): Promise<void> {
    // assumes only one auto-export is set up
    const path: string = await Zotero.DB.valueQueryAsync('SELECT path FROM betterbibtex.autoExport')
    await Zotero.BetterBibTeX.PrefPane.autoexport.edit({
      getAttribute(name: string): string | number { // eslint-disable-line prefer-arrow/prefer-arrow-functions
        switch (name) {
          case 'data-ae-field': return field
          case 'data-ae-path': return path
          default: throw new Error(`unexpected attribute ${name}`)
        }
      },
      checked: value,
      value,
    })
  }
}
