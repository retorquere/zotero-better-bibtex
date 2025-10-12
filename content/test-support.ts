import { AutoExport, JobSetting } from './auto-export'
import * as ZoteroDB from './db/zotero'
import { log } from './logger'
import { Translators } from './translators'
import { Formatter as CAYWFormatter } from './cayw/formatter'
import { getItemsAsync } from './get-items-async'
import { AUXScanner } from './aux-scanner'
import * as Extra from './extra'
import { defaults } from '../gen/preferences/meta'
import { Preference } from './prefs'
import * as memory from './memory'
import { Cache } from './translators/worker'

// import { Bench } from 'tinybench'

const setatstart: string[] = [ 'testing', 'cache' ].filter(p => Preference[p] !== defaults[p])

const idleService: any = Components.classes['@mozilla.org/widget/useridleservice;1'].getService(Components.interfaces.nsIUserIdleService)

export class TestSupport {
  public timedMemoryLog: any
  public scenario: string

  public isIdle(): boolean {
    return idleService.idleTime > 1000
  }

  public async waitForIdle(): Promise<number> {
    const start = Date.now()
    while (idleService.idleTime > 1000) await Zotero.Promise.delay(1000)
    return Date.now() - start
  }

  public memoryState(snapshot: string): memory.State {
    const state = memory.state(snapshot)
    return state
  }

  public autoExportRunning(): number {
    // return await Zotero.DB.valueQueryAsync('SELECT COUNT(*) FROM betterbibtex.autoExport WHERE status = \'running\'') as number
    return 0
  }

  public async reset(scenario: string): Promise<void> {
    log.info(`test environment reset for ${ scenario }`)
    await this.resetCache()

    const prefix = 'translators.better-bibtex.'
    for (const [ pref, value ] of Object.entries(defaults)) {
      if (setatstart.includes(pref)) continue
      Zotero.Prefs.set(prefix + pref, value)
    }

    Zotero.Prefs.set(`${ prefix }testing`, true)

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

    AutoExport.removeAll()

    items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    if (items.length !== 0) throw new Error('library not empty after reset')

    await Zotero.Promise.delay(1000)

    await Zotero.DB.executeTransaction(async () => {
      Zotero.Prefs.set('purge.tags', true)
      await Zotero.Tags.purge()
    })

    if (Zotero.BetterBibTeX.KeyManager.all().length !== 0) throw new Error(`keystore has ${ Zotero.BetterBibTeX.KeyManager.all().length } entries after reset`)
  }

  public async librarySize(): Promise<number> {
    const itemIDs: number[] = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    return itemIDs.length
  }

  public async importFile(path: string, createNewCollection: boolean, preferences: Record<string, number | boolean | string>, bibstyle?: string): Promise<number> {
    preferences = preferences || {}

    for (let [ pref, value ] of Object.entries(preferences)) {
      if (pref === 'texmap') continue
      if (typeof defaults[pref] === 'undefined') throw new Error(`Unsupported preference ${ pref } in test case`)
      if (Array.isArray(value)) value = value.join(',')
      Zotero.Prefs.set(`translators.better-bibtex.${ pref }`, value)
    }

    if (!path) return 0

    const before = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)

    if (path.endsWith('.aux')) {
      await AUXScanner.scan(path)
      // for some reason, the imported collection shows up as empty right after the import >:
      await Zotero.Promise.delay(1500)
    }
    else {
      await (Zotero.getMainWindow() as unknown as any).Zotero_File_Interface.importFile({ file: Zotero.File.pathToFile(path), createNewCollection: !!createNewCollection })
    }

    await Zotero.Promise.delay(Zotero.Prefs.get('translators.better-bibtex.itemObserverDelay') as number * 3)

    const after = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)

    if (bibstyle) {
      const items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true)
      const cslEngine = Zotero.Styles.get(bibstyle).getCiteProc('en-US', 'text')
      log.info(`${bibstyle}:\n${Zotero.Cite.makeFormattedBibliographyOrCitationList(cslEngine, items, 'text')}`)
      cslEngine.free()
    }

    return (after.length - before.length)
  }

  public async exportLibrary(translatorID: string, displayOptions: Record<string, number | string | boolean>, path?: string, collectionName?: string): Promise<string> {
    let scope
    if (collectionName) {
      let name = collectionName
      if (name[0] === '/') name = name.substring(1) // don't do full path parsing right now
      for (const collection of Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID)) {
        if (collection.name === name) scope = { type: 'collection', collection }
      }
      if (!scope) throw new Error(`Collection '${ name }' not found`)
    }
    else {
      scope = { type: 'library', id: Zotero.Libraries.userLibraryID }
    }

    const job = { translatorID, displayOptions: displayOptions as Record<string, boolean>, scope, path }

    if (displayOptions.keepUpdated) await AutoExport.register(job)

    const start = Date.now()
    try {
      const res = await Translators.exportItems(job)
      log.debug('json-rpc:', job, res)
      return res
    }
    catch (err) {
      log.error('json-rpc: export failed:', job, err)
    }
    finally {
      log.info(`performance: ${ translatorID } export took ${ Date.now() - start }`)
    }
  }

  public async dumpCache(filename: string): Promise<void> {
    await IOUtils.writeUTF8(filename, JSON.stringify(await Cache.dump(), null, 2))
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
    throw new Error(`failed to select ${ ids }`)
  }

  public async find(query: { contains: string; is: string }, expected = 1): Promise<number[]> {
    if (!Object.keys(query).length) throw new Error(`empty query ${ JSON.stringify(query) }`)

    let ids: number[] = []

    if (query.contains) ids = ids.concat(Zotero.BetterBibTeX.KeyManager.all().filter(key => key.citationKey.toLowerCase().includes(query.contains.toLowerCase())).map(key => key.itemID))
    if (query.is) ids = ids.concat(Zotero.BetterBibTeX.KeyManager.find({ where: { citationKey: query.is }}).map(key => key.itemID))

    const s = (new Zotero.Search)
    for (const [ mode, text ] of Object.entries(query)) {
      if (![ 'is', 'contains' ].includes(mode)) throw new Error(`unsupported search mode ${ mode }`)
      s.addCondition('field', mode as _ZoteroTypes.Search.Operator, text)
    }
    ids = ids.concat(await s.search())
    ids = Array.from(new Set(ids))
    if (!ids || !ids.length) throw new Error(`No item found matching ${ JSON.stringify(query) }`)
    if (ids.length !== expected) throw new Error(`${ JSON.stringify(query) } matched ${ JSON.stringify(ids) }, but only ${ expected } expected`)

    return Array.from(new Set(ids))
  }

  public async pick(format: string, citations: { id: number[]; uri: string; citationKey: string }[]): Promise<string> {
    for (const citation of citations) {
      if (citation.id.length !== 1) throw new Error(`Expected 1 item, got ${ citation.id.length }`)
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
      if (action !== 'pin') throw new Error(`Don't know how to ${ action } ${ citationKey }`)
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
          throw new Error(`TestSupport.pinCiteKey: unsupported action ${ action }`)
      }
    }
  }

  public async resetCache(): Promise<void> {
    await Cache.drop()
  }

  public async merge(ids: number[]): Promise<void> {
    const before = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)

    let other = await getItemsAsync(ids)
    const master = other.find(item => item.id === ids[0])
    other = other.filter(item => item.id !== ids[0])
    const json = master.toJSON()
    // Exclude certain properties that are empty in the cloned object, so we don't clobber them
    const { relations: _r, collections: _c, tags: _t, ...keep } = master.clone().toJSON() // eslint-disable-line @typescript-eslint/no-unused-vars
    Object.assign(json, keep)

    master.fromJSON(json)
    await Zotero.Items.merge(master, other)

    await Zotero.Promise.delay(1500)

    const after = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    if (before.length - after.length !== (ids.length - 1)) throw new Error(`merging ${ ids.length }: before = ${ before.length }, after = ${ after.length }`)
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
      if (!found) throw new Error(`${ path } not found`)
    }

    const itemIDs = collection.getChildItems(true)
    if (!itemIDs.length) throw new Error(`${ path } is empty`)
    await Zotero.DB.executeTransaction(async () => {
      await collection.removeItems(itemIDs)
    })
    if (collection.getChildItems(true).length) throw new Error(`${ path } not empty`)
  }

  public citationKey(itemID: number): string {
    return Zotero.BetterBibTeX.KeyManager.get(itemID).citationKey
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

  public editAutoExport(field: JobSetting, value: boolean | string): void {
    // assumes only one auto-export is set up
    const path: string = AutoExport.all()[0].path
    AutoExport.edit(path, field, value)
  }

  public async keyPair(): Promise<string> {
    const subtle = Zotero.getMainWindow().crypto.subtle

    const keyPair = await subtle.generateKey({
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt'])

    function arrayBufferToBase64(buffer: ArrayBuffer): string {
      let binary = ''
      const bytes = new Uint8Array(buffer)
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return btoa(binary)
    }

    async function exportKeyToPem(key: CryptoKey): Promise<string> {
      const exported = await subtle.exportKey(key.type === 'public' ? 'spki' : 'pkcs8', key)
      const base64Key = arrayBufferToBase64(exported)
        .replace(/(.{80})/g, '$1\n')

      if (key.type === 'public') {
        return `-----BEGIN PUBLIC KEY-----\n${base64Key}\n-----END PUBLIC KEY-----`
      }
      else {
        return `-----BEGIN PRIVATE KEY-----\n${base64Key}\n-----END PRIVATE KEY-----`
      }
    }

    return `${await exportKeyToPem(keyPair.publicKey)}\n${await exportKeyToPem(keyPair.privateKey)}`
  }

  /*
  async benchmark(tests: Array<{ translator: string, runs: number, cached?: boolean }>, _path?: string): Promise<Record<string, string | number>[]> {
    await Zotero.BetterBibTeX.ready

    const bench = new Bench({
      now: () => Date.now(),
    })

    const stock = {
      'CSL JSON': 'bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7',
      BibTeX: '9cb70025-a888-4a29-a210-93ec52da40d4',
    }

    const displayOptions = { worker: true }

    const add = ({ translator, cached }: { translator: string, cached?: boolean }) => {
      const translatorID = Translators.byLabel[translator]?.translatorID || stock[translator]
      const better = typeof cached === 'boolean'

      const label = better ? `${translator}, ${cached ? '' : 'un'}cached` : translator

      const beforeAll = !better ? undefined : async () => {
        Preference.cache = cached
        if (cached) {
          log.debug('bench: filling cache for', label)
          await this.waitForIdle()
          await this.exportLibrary(translatorID, displayOptions)
          await this.exportLibrary(translatorID, displayOptions)
          await this.exportLibrary(translatorID, displayOptions)
        }
      }

      const beforeEach = async () => {
        await this.waitForIdle()
      }

      bench.add(label, async () => { await this.exportLibrary(translatorID, displayOptions) }, { beforeAll, beforeEach })
    }

    for (const test of tests) {
      add(test)
    }

    await bench.run()
    return bench.tasks.map(task => {
      if (!task.result) return null
      return {
        'Task Name': task.name,
        'ops/sec': task.result.error ? 'NaN' : parseInt(task.result.hz.toString(), 10).toLocaleString(),
        'Average Time (ms)': task.result.error ? 'NaN' : task.result.mean * 1000,
        Margin: task.result.error ? 'NaN' : `\xb1${task.result.rme.toFixed(2)}%`,
        Samples: task.result.error ? 'NaN' : task.result.samples.length,
      }
    })
  }
  */
}
