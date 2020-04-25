declare const Zotero: any

declare const Components: any
Components.utils.import('resource://gre/modules/Services.jsm')
declare const Services: any
declare class ChromeWorker extends Worker { }

import { Preferences as Prefs } from './prefs'
import { Serializer } from './serializer'
import * as log from './debug'
import { DB as Cache, selector as cacheSelector } from './db/cache'
import { DB } from './db/main'
import * as Extra from './extra'
import { sleep } from './sleep'
import { flash } from './flash'

import * as prefOverrides from '../gen/preferences/auto-export-overrides.json'
import * as translatorMetadata from '../gen/translators.json'

import { TaskEasy  as Queue } from 'task-easy'

type Trace = {
  translator: string
  items: number
  cached: {
    serializer: number
    export: number
  }
  prep: {
    total: number
    duration: number[]
  }
  export: {
    total: number
    duration: number[]
  }
}

const trace: Trace[] = []

interface IPriority {
  priority: number
  timestamp: number
}

type ExportScope = { type: 'items', items: any[] } | { type: 'library', id: number } | { type: 'collection', collection: any }
type ExportJob = {
  scope?: ExportScope
  path?: string
  preferences?: Record<string, boolean | number | string>
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Translators = new class { // tslint:disable-line:variable-name
  public byId: any
  public byName: any
  public byLabel: any
  public itemType: { note: number, attachment: number }

  private queue = new Queue((t1: IPriority, t2: IPriority) => t1.priority === t2.priority ? t1.timestamp < t2.timestamp : t1.priority > t2.priority)

  public workers: { total: number, running: Set<number> } = {
    total: 0,
    running: new Set,
  }

  constructor() {
    Object.assign(this, translatorMetadata)
  }

  public async init() {
    const start = Date.now()

    this.itemType = {
      note: Zotero.ItemTypes.getID('note'),
      attachment: Zotero.ItemTypes.getID('attachment'),
    }

    let reinit = false

    if (Prefs.get('removeStock')) {
      if (this.uninstall('BibLaTeX', 'b6e39b57-8942-4d11-8259-342c46ce395f')) reinit = true
      if (this.uninstall('BibTeX', '9cb70025-a888-4a29-a210-93ec52da40d4')) reinit = true
    }

    // cleanup old translators
    if (this.uninstall('Better BibTeX Quick Copy', '9b85ff96-ceb3-4ca2-87a9-154c18ab38b1')) reinit = true

    for (const header of Object.values(this.byId)) {
      if (await this.install(header)) reinit = true
    }

    if (reinit) {
      let restart = false
      log.debug('new translators:', { ask: Prefs.get('newTranslatorsAskRestart'), testing: Prefs.testing })
      if (Prefs.get('newTranslatorsAskRestart') && !Prefs.testing) {
        const dontAskAgain = { value: false }
        const ps = Services.prompt
        const index = ps.confirmEx(
          null, // parent
          Zotero.BetterBibTeX.getString('BetterBibTeX.startup.installingTranslators.new'), // dialogTitle
          Zotero.BetterBibTeX.getString('BetterBibTeX.startup.installingTranslators.new.DnD'), // text

          // button flags
          ps.BUTTON_POS_0 * ps.BUTTON_TITLE_IS_STRING + ps.BUTTON_POS_0_DEFAULT
            + ps.BUTTON_POS_1 * ps.BUTTON_TITLE_IS_STRING,

          // button messages
          Zotero.getString('general.restartNow'),
          Zotero.getString('general.restartLater'),
          null,

          Zotero.BetterBibTeX.getString('BetterBibTeX.startup.installingTranslators.new.dontAskAgain'), // check message
          dontAskAgain // check state
        )

        Prefs.set('newTranslatorsAskRestart', !dontAskAgain.value)

        restart = (index === 0)
      }

      if (restart) Zotero.Utilities.Internal.quit(true)

      try {
        await Zotero.Translators.reinit()
      } catch (err) {
        log.error('Translator.inits: reinit failed @', (new Date()).valueOf() - start, err)
      }
    }
  }

  public getTranslatorId(name) {
    const _name = name.toLowerCase()

    // shortcuts
    if (_name === 'jzon') return Translators.byLabel.BetterBibTeXJSON.translatorID
    if (_name === 'bib') return Translators.byLabel.BetterBibLaTeX.translatorID

    for (const [id, translator] of (Object.entries(this.byId) as [string, ITranslatorHeader][])) {
      if (! ['yaml', 'json', 'bib'].includes(translator.target) ) continue
      if (! translator.label.startsWith('Better ') ) continue

      if (translator.label.replace('Better ', '').replace(' ', '').toLowerCase() === _name) return id
      if (translator.label.split(' ').pop().toLowerCase() === _name) return id
    }

    // allowed to pass GUID
    return name
  }

  public async importString(str) {
    const translation = new Zotero.Translate.Import()
    translation.setString(str)

    const zp = Zotero.getActiveZoteroPane()

    if (!zp.collectionsView.editable) {
      await zp.collectionsView.selectLibrary()
    }

    const translators = await translation.getTranslators()

    if (!translators.length) throw new Error('No translators found')

    const libraryID = zp.getSelectedLibraryID()
    await zp.collectionsView.selectLibrary(libraryID)

    translation.setTranslator(translators[0])

    await translation.translate({ libraryID })

    return translation.newItems
  }

  public async exportItemsByQueuedWorker(translatorID: string, displayOptions: Record<string, boolean>, options: ExportJob) {
    const workers = Math.max(Prefs.get('workers'), 1) // if you're here, at least one worker must be available

    if (this.workers.running.size > workers) {
      return this.queue.schedule(this.exportItemsByWorker.bind(this, translatorID, displayOptions, options), [], { priority: 1, timestamp: (new Date()).getTime() })
    } else {
      return this.exportItemsByWorker(translatorID, displayOptions, options)
    }
  }

  public async exportItemsByWorker(translatorID: string, displayOptions: Record<string, boolean>, options: ExportJob) {
    await Zotero.BetterBibTeX.ready

    const translator = this.byId[translatorID]

    const start = Date.now()
    let now

    const current_trace: Trace = {
      translator: translator.label,
      items: 0,
      cached: {
        serializer: 0,
        export: 0,
      },
      prep: {
        total: 0,
        duration: [],
      },
      export: {
        total: 0,
        duration: [],
      },
    }
    trace.push(current_trace)

    options.preferences = options.preferences || {}
    displayOptions = displayOptions || {}

    // undo override smuggling so I can pre-fetch the cache
    const override = 'preference_'
    for (const [pref, value] of Object.entries(displayOptions)) {
      if (pref.startsWith(override)) {
        options.preferences[pref.replace(override, '')] = (value as unknown as any) // number could actually be string or bool but it's just here to quiet typescript
        delete displayOptions[pref]
      }
    }

    const caching = !(
      // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
      displayOptions.exportFileData

      // jabref 4 stores collection info inside the reference, and collection info depends on which part of your library you're exporting
      || (translator.label.includes('TeX') && options.preferences.jabrefFormat === 4) // tslint:disable-line:no-magic-numbers

      // if you're looking at this.exportPath or this.exportDir in the postscript you're probably outputting something different based on it
      || (((options.preferences.postscript as string) || '').indexOf('Translator.exportPath') >= 0)
      || (((options.preferences.postscript as string) || '').indexOf('Translator.exportDir') >= 0)

      // relative file paths are going to be different based on the file being exported to
      || options.preferences.relativeFilePaths
    )

    let last_trace = start

    const cache = caching && Cache.getCollection(translator.label)

    const params = Object.entries({
      client: Prefs.client,
      version: Zotero.version,
      platform: Prefs.platform,
      translator: translator.label,
      output: options.path || '',
      localeDateOrder: Zotero.BetterBibTeX.localeDateOrder,
    }).map(([k, v]) => `${encodeURI(k)}=${encodeURI(v)}`).join('&')

    this.workers.total += 1
    const id = this.workers.total
    this.workers.running.add(id)
    const prefix = `{${translator.label} worker ${id}}`

    log.debug(`Beginning translation with ${prefix}`)

    const deferred = Zotero.Promise.defer()
    let worker: ChromeWorker = null
    // WHAT IS GOING ON HERE FIREFOX?!?! A *NetworkError* for a xpi-internal resource:// URL?!
    for (let attempt = 0; !worker && attempt < 5; attempt++) { // tslint:disable-line:no-magic-numbers
      try {
        if (attempt > 0) await sleep(2 * 1000 * attempt) // tslint:disable-line:no-magic-numbers
        worker = new ChromeWorker(`resource://zotero-better-bibtex/worker/Zotero.js?${params}`)
      } catch (err) {
        log.debug('new ChromeWorker:', err)
      }
    }
    if (!worker) {
      log.debug('what the actual...')
      deferred.reject('could not get a ChromeWorker')
      flash(
        'Failed to start background export',
        'Could not start a background export after 5 attempts. Background exports have been disabled -- PLEASE report this as a bug at the Better BibTeX github project',
        15 // tslint:disable-line:no-magic-numbers
      )
      Prefs.set('workers', 0)
      return
    }

    const config: BBTWorker.Config = {
      preferences: { ...Prefs.all(), ...options.preferences },
      options: displayOptions || {},
      items: [],
      collections: [],
      cslItems: {},
      cache: {},
    }

    worker.onmessage = (e: { data: BBTWorker.Message }) => {
      switch (e.data?.kind) {
        case 'error':
          log.debug('QBW: failed:', Date.now() - start)
          log.error(e.data)
          Zotero.debug(`${prefix} error: ${e.data.message}`)
          deferred.reject(e.data.message)
          worker.terminate()
          this.workers.running.delete(id)
          break

        case 'debug':
          Zotero.debug(`${prefix} ${e.data.message}`)
          break

        case 'item':
          now = Date.now()
          current_trace.export.duration.push(now - last_trace)
          last_trace = now
          break

        case 'done':
          current_trace.export.total = (Date.now() - start) - current_trace.prep.total
          let status = `QBW: ${prefix} done,`
          status += `${config.items.length} items, `
          status += `total duration ${(current_trace.prep.total + current_trace.export.total) / 1000}s ` // tslint:disable-line:no-magic-numbers
          status += `of which ${current_trace.prep.total / 1000}s prep, ` // tslint:disable-line:no-magic-numbers
          status += `serialization cache ${current_trace.cached.serializer}%, export cache ${current_trace.cached.export}%`
          log.debug(status)
          log.debug(current_trace)
          deferred.resolve(e.data.output)
          worker.terminate()
          this.workers.running.delete(id)
          break

        case 'cache':
          let { itemID, reference, metadata } = e.data
          log.debug(prefix, 'caught cache for', itemID)
          if (!metadata) metadata = {}

          if (!cache) {
            const msg = `worker.cacheStore: cache ${translator.label} not found`
            log.error(msg)
            log.debug('QBW: failed:', Date.now() - start)
            deferred.reject(msg)
            worker.terminate()
            this.workers.running.delete(id)
          }

          const selector = cacheSelector(itemID, config.options, config.preferences)
          let cached = cache.findOne(selector)

          if (cached) {
            cached.reference = reference
            cached.metadata = metadata
            cached = cache.update(cached)

          } else {
            cache.insert({...selector, reference, metadata})
          }
          break

        default:
          if (JSON.stringify(e) !== '{"isTrusted":true}') { // why are we getting this?
            Zotero.debug(`unexpected message in host from ${prefix} ${JSON.stringify(e)}`)
          }
          break
      }
    }

    worker.onerror = e => {
      Zotero.debug(`${prefix} error: ${e}`)
      log.debug('QBW: failed:', Date.now() - start)
      deferred.reject(e.message)
      worker.terminate()
      this.workers.running.delete(id)
    }

    const scope = this.exportScope(options.scope)
    let items: any[] = []
    let collections: any[] = []
    switch (scope.type) {
      case 'library':
        items = await Zotero.Items.getAll(scope.id, true)
        collections = Zotero.Collections.getByLibrary(scope.id, true)
        break

      case 'items':
        items = scope.items
        break

      case 'collection':
        collections = Zotero.Collections.getByParent(scope.collection.id, true)
        const items_with_duplicates = new Set(scope.collection.getChildItems())
        for (const collection of collections) {
          for (const item of collection.getChildItems()) {
            items_with_duplicates.add(item) // sure hope getChildItems doesn't return a new object?!
          }
        }
        items = Array.from(items_with_duplicates.values())
        break

      default:
        throw new Error(`Unexpected scope: ${Object.keys(scope)}`)
    }

    // use a loop instead of map so we can await for beachball protection
    let batch = Date.now()
    const count = { cached: 0 }
    config.items = []
    for (const item of items) {
      config.items.push(Serializer.fast(item, count))

      // sleep occasionally so the UI gets a breather
      if ((Date.now() - batch) > 1000) { // tslint:disable-line:no-magic-numbers
        await sleep(0) // tslint:disable-line:no-magic-numbers
        batch = Date.now()
      }

      now = Date.now()
      current_trace.prep.duration.push(now - last_trace)
      last_trace = now
    }
    current_trace.items = config.items.length
    current_trace.cached.serializer = count.cached

    if (this.byId[translatorID].configOptions?.getCollections) {
      config.collections = collections.map(collection => {
        collection = collection.serialize(true)
        collection.id = collection.primary.collectionID
        collection.name = collection.fields.name
        return collection
      })
    }

    // pre-fetch cache
    if (cache) {
      const query = cacheSelector(config.items.map(item => item.itemID), displayOptions, config.preferences)

      // not safe in async!
      const cloneObjects = cache.cloneObjects
      cache.cloneObjects = false
      // uncloned is safe because it gets serialized in the transfer
      config.cache = cache.find(query).reduce((acc, cached) => {
        current_trace.cached.export += 1
        // direct-DB access for speed...
        cached.meta.updated = (new Date).getTime() // touches the cache object so it isn't reaped too early
        acc[cached.itemID] = cached
        return acc
      }, {})
      cache.cloneObjects = cloneObjects
      cache.dirty = true
    }

    // pre-fetch CSL serializations
    // TODO: I should probably cache these
    if (translator.label.includes('CSL')) {
      for (const item of config.items) {
        // if there's a cached item, we don't need a fresh CSL item since we're not regenerating it anyhow
        if (config.cache[item.itemID]) continue

        // this should done in the translator, but since itemToCSLJSON in the worker version doesn't actually execute itemToCSLJSON but just
        // fetches the version we create here *before* the translator starts, changes to the 'item' inside the translator are essentially ignored.
        // There's no way around this until Zotero makes export translators async; we prep the itemToCSLJSON versions here so they can be "made" synchronously
        // inside the translator
        Object.assign(item, Extra.get(item.extra, null, 'csl'))
        config.cslItems[item.itemID] = Zotero.Utilities.itemToCSLJSON(item)
      }
    }

    now = Date.now()
    current_trace.prep.duration.push(now - last_trace)
    current_trace.prep.total = now - start
    last_trace = now

    try {
      worker.postMessage(JSON.parse(JSON.stringify(config)))
    } catch (err) {
      worker.terminate()
      this.workers.running.delete(id)
      log.error(err)
      deferred.reject(err)
      log.debug('QBW: failed:', Date.now() - start)
    }

    return deferred.promise
  }

  public async exportItems(translatorID: string, displayOptions: any, scope: ExportScope, path = null) {
    await Zotero.BetterBibTeX.ready

    const start = Date.now()

    const deferred = Zotero.Promise.defer()
    const translation = new Zotero.Translate.Export()

    scope = this.exportScope(scope)

    switch (scope.type) {
      case 'library':
        translation.setLibraryID(scope.id)
        break

      case 'items':
        translation.setItems(scope.items)
        break

      case 'collection':
        translation.setCollection(scope.collection)
        break

      default:
        throw new Error(`Unexpected scope: ${Object.keys(scope)}`)
    }

    translation.setTranslator(translatorID)
    if (displayOptions && (Object.keys(displayOptions).length !== 0)) translation.setDisplayOptions(displayOptions)

    if (path) {
      let file = null

      try {
        file = Zotero.File.pathToFile(path)
        // path could exist but not be a regular file
        if (file.exists() && !file.isFile()) file = null
      } catch (err) {
        // or Zotero.File.pathToFile could have thrown an error
        log.error('Translators.exportItems:', err)
        file = null
      }
      if (!file) {
        deferred.reject(Zotero.BetterBibTeX.getString('Translate.error.target.notaFile', { path }))
        return deferred.promise
      }

      // the parent directory could have been removed
      if (!file.parent || !file.parent.exists()) {
        deferred.reject(Zotero.BetterBibTeX.getString('Translate.error.target.noParent', { path }))
        return deferred.promise
      }

      translation.setLocation(file)
    }

    translation.setHandler('done', (obj, success) => {
      if (success) {
        deferred.resolve(obj ? obj.string : undefined)
      } else {
        log.error('Translators.exportItems failed in', { time: Date.now() - start, translatorID, displayOptions, path })
        deferred.reject('translation failed')
      }
    })

    translation.translate()

    return deferred.promise
  }

  public uninstall(label, id) {
    try {
      const fileName = Zotero.Translators.getFileNameFromLabel(label, id)
      const destFile = Zotero.getTranslatorsDirectory()
      destFile.append(fileName)
      if (destFile.exists()) {
        destFile.remove(false)
        return true
      }
    } catch (err) {
      log.error(`Translators.uninstall: failed to remove ${label}:`, err)
      return true
    }

    return false
  }

  public async install(header) {
    if (!header.label || !header.translatorID) throw new Error('not a translator')

    let installed = null
    try {
      installed = Zotero.Translators.get(header.translatorID)
    } catch (err) {
      log.error('Translators.install', header, err)
      installed = null
    }

    header = JSON.parse(Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.json`))
    const code = Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.js`)

    if (installed?.configOptions?.hash === header.configOptions.hash) {
      log.debug('Translators.install:', header.label, 'not reinstalling', header.configOptions.hash)
      return false

    } else if (installed) {
      log.debug('Translators.install:', header.label, 'replacing', installed.lastUpdated, 'with', header.lastUpdated, `(${header.configOptions.hash})`)

    } else {
      log.debug('Translators.install:', header.label, 'not installed, installing', header.lastUpdated, `(${header.configOptions.hash})`)

    }

    const cache = Cache.getCollection(header.label)
    cache.removeDataOnly()
    // importing AutoExports would be circular, so access DB directly
    const autoexports = DB.getCollection('autoexport')
    for (const ae of autoexports.find({ translatorID: header.translatorID })) {
      autoexports.update({ ...ae, status: 'scheduled' })
    }

    try {
      await Zotero.Translators.save(header, code)

    } catch (err) {
      log.error('Translator.install', header, 'failed:', err)
      this.uninstall(header.label, header.translatorID)
    }

    return true
  }

  public async uncached(translatorID: string, displayOptions: any, scope: any): Promise<any[]> {
    // get all itemIDs in cache
    const cache = Cache.getCollection(this.byId[translatorID].label)
    const query = {
      exportNotes: !!displayOptions.exportNotes,
      useJournalAbbreviation: !!displayOptions.useJournalAbbreviation,
    }
    for (const pref of prefOverrides) {
      if (typeof displayOptions[`preference_${pref}`] === 'undefined') {
        query[pref] = Prefs.get(pref)
      } else {
        query[pref] = displayOptions[`preference_${pref}`]
      }
    }
    const cached = new Set(cache.find(query).map(item => item.itemID))

    if (scope.items) {
      return scope.items.filter(item => !cached.has(item.id))
    }

    let sql: string = null
    const cond = `i.itemTypeID NOT IN (${this.itemType.note}, ${this.itemType.attachment}) AND i.itemID NOT IN (SELECT itemID FROM deletedItems)`
    if (scope.library) {
      sql = `SELECT i.itemID FROM items i WHERE i.libraryID = ${scope.library} AND ${cond}`

    } else if (scope.collection) {
      sql = `SELECT i.itemID FROM collectionItems ci JOIN items i ON i.itemID = ci.itemID WHERE ci.collectionID = ${scope.collection.id} AND ${cond}`

    } else {
      log.error('Translators.uncached: no active scope')
      return []

    }

    return (await Zotero.DB.queryAsync(sql)).map(item => parseInt(item.itemID)).filter(itemID => !cached.has(itemID))
  }

  private exportScope(scope: ExportScope): ExportScope {
    if (!scope) scope = { type: 'library', id: Zotero.Libraries.userLibraryID }

    if (scope.type === 'collection' && typeof scope.collection === 'number') {
      return { type: 'collection', collection: Zotero.Collections.get(scope.collection) }
    }

    switch (scope.type) {
      case 'items':
        if (! scope.items?.length ) throw new Error(`invalid scope: ${JSON.stringify(scope)}`)
        break
      case 'collection':
        if (typeof scope.collection?.id !== 'number') throw new Error(`invalid scope: ${JSON.stringify(scope)}`)
        break
      case 'library':
        if (typeof scope.id !== 'number') throw new Error(`invalid scope: ${JSON.stringify(scope)}`)
        break
      default:
        throw new Error(`invalid scope: ${JSON.stringify(scope)}`)
    }

    return scope
  }
}

const OK = 200
const SERVER_ERROR = 500
Zotero.Server.Endpoints['/better-bibtex/translations/stats'] = class {
  public supportedMethods = ['GET']

  public init(request) {
    try {
      return [ OK, 'application/json', JSON.stringify(trace) ]

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}
