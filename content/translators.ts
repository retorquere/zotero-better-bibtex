/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unsafe-return */

declare const Zotero: any
declare const Components: any

Components.utils.import('resource://gre/modules/Services.jsm')
declare const Services: any
declare class ChromeWorker extends Worker { }

Components.utils.import('resource://zotero/config.js')
declare const ZOTERO_CONFIG: any

import { Preference } from '../gen/preferences'
import { Serializer } from './serializer'
import { log } from './logger'
import { DB as Cache, selector as cacheSelector } from './db/cache'
import { DB } from './db/main'
import { sleep } from './sleep'
import { flash } from './flash'

import { override } from './prefs-meta'
import * as translatorMetadata from '../gen/translators.json'

import { TaskEasy } from 'task-easy'

interface Priority {
  priority: number
  timestamp: number
}

type ExportScope = { type: 'items', items: any[] } | { type: 'library', id: number } | { type: 'collection', collection: any }
type ExportJob = {
  scope?: ExportScope
  path?: string
  preferences?: Record<string, boolean | number | string>
  started?: number
  canceled?: boolean
}

class Queue {
  private queue: TaskEasy<Priority>

  constructor() {
    this.queue = new TaskEasy((t1: Priority, t2: Priority) => t1.priority === t2.priority ? t1.timestamp < t2.timestamp : t1.priority > t2.priority)
  }

  public async schedule(task: TaskEasy.Task<string>, translatorID: string, displayOptions: Record<string, boolean>, job: ExportJob) {
    job.started = Date.now()
    if (job.path) {
      for (const scheduled of (this.queue as any).tasks) {
        if (scheduled.started < job.started && scheduled.args && scheduled.args.length === 3) { // eslint-disable-line no-magic-numbers
          const scheduledJob = (scheduled.args[2] as ExportJob)
          if (scheduledJob.path && scheduledJob.path === job.path) {
            log.debug(job.started, 'cancels export to', job.path, 'started at', scheduledJob.started)
            scheduledJob.canceled = true
          }
        }
      }
    }
    return await this.queue.schedule(task, [translatorID, displayOptions, job], { priority: 1, timestamp: job.started })
  }
}

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

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Translators = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public byId: Record<string, ITranslatorHeader>
  public byName: Record<string, ITranslatorHeader>
  public byLabel: Record<string, ITranslatorHeader>
  public itemType: { note: number, attachment: number }

  private queue = new Queue

  public workers: { total: number, running: Set<number>, disabled: boolean, startup: number } = {
    total: 0,
    running: new Set,
    disabled: false,
    startup: 0,
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

    // cleanup old translators
    this.uninstall('Better BibTeX Quick Copy')
    this.uninstall('\u672B BetterBibTeX JSON (for debugging)')
    this.uninstall('BetterBibTeX JSON (for debugging)')

    for (const header of Object.values(this.byId)) {
      if (await this.install(header)) reinit = true
    }

    if (reinit) {
      let restart = false
      if (Preference.newTranslatorsAskRestart && !Preference.testing) {
        const dontAskAgain = { value: false }
        const ps = Services.prompt
        const index = ps.confirmEx(
          null, // parent
          Zotero.BetterBibTeX.getString('BetterBibTeX.startup.installingTranslators.new'), // dialogTitle
          Zotero.BetterBibTeX.getString('BetterBibTeX.startup.installingTranslators.new.DnD'), // text

          // button flags
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          ps.BUTTON_POS_0 * ps.BUTTON_TITLE_IS_STRING + ps.BUTTON_POS_0_DEFAULT
            + ps.BUTTON_POS_1 * ps.BUTTON_TITLE_IS_STRING,

          // button messages
          Zotero.getString('general.restartNow'),
          Zotero.getString('general.restartLater'),
          null,

          Zotero.BetterBibTeX.getString('BetterBibTeX.startup.installingTranslators.new.dontAskAgain'), // check message
          dontAskAgain // check state
        )

        Preference.newTranslatorsAskRestart = !dontAskAgain.value

        restart = (index === 0)
      }

      if (restart) Zotero.Utilities.Internal.quit(true)

      try {
        await Zotero.Translators.reinit()
      }
      catch (err) {
        log.error('Translator.inits: reinit failed @', (new Date()).valueOf() - start, err)
      }
    }
  }

  public getTranslatorId(name) {
    const name_lc = name.toLowerCase()

    // shortcuts
    if (name_lc === 'jzon') return Translators.byLabel.BetterBibTeXJSON.translatorID
    if (name_lc === 'bib') return Translators.byLabel.BetterBibLaTeX.translatorID

    for (const [id, translator] of (Object.entries(this.byId))) {
      if (! ['yaml', 'json', 'bib'].includes(translator.target) ) continue
      if (! translator.label.startsWith('Better ') ) continue

      if (translator.label.replace('Better ', '').replace(' ', '').toLowerCase() === name_lc) return id
      if (translator.label.split(' ').pop().toLowerCase() === name_lc) return id
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

  public async exportItemsByQueuedWorker(translatorID: string, displayOptions: Record<string, boolean>, job: ExportJob) {
    if (this.workers.running.size < Preference.workers) {
      return this.queue.schedule(this.exportItemsByWorker.bind(this), translatorID, displayOptions, job)
    }
    else {
      return this.exportItemsByWorker(translatorID, displayOptions, job)
    }
  }

  public async exportItemsByWorker(translatorID: string, displayOptions: Record<string, boolean>, job: ExportJob) {
    if (job.path && job.canceled) {
      log.debug('export to', job.path, 'started at', job.started, 'canceled')
      return ''
    }

    await Zotero.BetterBibTeX.ready
    if (job.path && job.canceled) {
      log.debug('export to', job.path, 'started at', job.started, 'canceled')
      return ''
    }

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

    job.preferences = job.preferences || {}
    displayOptions = displayOptions || {}

    // undo override smuggling so I can pre-fetch the cache
    const cloaked_override = 'preference_'
    for (const [pref, value] of Object.entries(displayOptions)) {
      if (pref.startsWith(cloaked_override)) {
        job.preferences[pref.replace(cloaked_override, '')] = (value as unknown as any)
        delete displayOptions[pref]
      }
    }

    const caching = Preference.workersCache && !(
      // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
      displayOptions.exportFileData

      // jabref 4 stores collection info inside the reference, and collection info depends on which part of your library you're exporting
      || (translator.label.includes('TeX') && job.preferences.jabrefFormat >= 4) // eslint-disable-line no-magic-numbers

      // relative file paths are going to be different based on the file being exported to
      || job.preferences.relativeFilePaths
    )

    let last_trace = start

    const cache = caching && Cache.getCollection(translator.label)

    const params = Object.entries({
      version: Zotero.version,
      platform: Preference.platform,
      translator: translator.label,
      output: job.path || '',
      localeDateOrder: Zotero.BetterBibTeX.localeDateOrder,
      debugEnabled: Zotero.Debug.enabled ? 'true' : 'false',
    }).map(([k, v]) => `${encodeURI(k)}=${encodeURI(v)}`).join('&')

    this.workers.total += 1
    const id = this.workers.total
    this.workers.running.add(id)
    const prefix = `{${translator.label} worker ${id}}`

    const deferred = Zotero.Promise.defer()
    let worker: ChromeWorker = null
    // WHAT IS GOING ON HERE FIREFOX?!?! A *NetworkError* for a xpi-internal resource:// URL?!
    for (let attempt = 0; !worker && attempt < 5; attempt++) { // eslint-disable-line no-magic-numbers
      try {
        if (attempt > 0) await sleep(2 * 1000 * attempt) // eslint-disable-line no-magic-numbers
        worker = new ChromeWorker(`resource://zotero-better-bibtex/worker/Zotero.js?${params}`)
      }
      catch (err) {
        log.error('new ChromeWorker:', err)
      }
    }
    if (!worker) {
      deferred.reject('could not get a ChromeWorker')
      flash(
        'Failed to start background export',
        'Could not start a background export after 5 attempts. Background exports have been disabled -- PLEASE report this as a bug at the Better BibTeX github project',
        15 // eslint-disable-line no-magic-numbers
      )
      this.workers.disabled = true
      // this returns a promise for a new export, but now a foreground export
      return this.exportItems(translatorID, displayOptions, job.scope, job.path)
    }

    const config: BBTWorker.Config = {
      preferences: { ...Preference.all, ...job.preferences },
      options: displayOptions || {},
      items: [],
      collections: [],
      cslItems: {},
      cache: {},
    }

    worker.onmessage = (e: { data: BBTWorker.Message }) => {
      switch (e.data?.kind) {
        case 'error':
          log.error('QBW failed:', Date.now() - start)
          log.status({error: true, worker: true}, e.data)
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
          deferred.resolve(e.data.output)
          worker.terminate()
          this.workers.running.delete(id)
          break

        case 'cache':
          let { itemID, reference, metadata } = e.data
          if (!metadata) metadata = {}

          if (!cache) {
            const msg = `worker.cacheStore: cache ${translator.label} not found`
            log.error(msg)
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

          }
          else {
            cache.insert({...selector, reference, metadata})
          }
          break

        default:
          if (JSON.stringify(e) !== '{"isTrusted":true}') { // why are we getting this?
            log.debug(`unexpected message in host from ${prefix} ${JSON.stringify(e)}`)
          }
          break
      }
    }

    worker.onerror = e => {
      Zotero.debug(`${prefix} error: ${e}`)
      log.error('QBW: failed:', Date.now() - start)
      deferred.reject(e.message)
      worker.terminate()
      this.workers.running.delete(id)
    }

    const scope = this.exportScope(job.scope)
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
    if (job.path && job.canceled) {
      log.debug('export to', job.path, 'started at', job.started, 'canceled')
      return ''
    }

    // use a loop instead of map so we can await for beachball protection
    let batch = Date.now()
    const count = { cached: 0 }
    config.items = []
    for (const item of items) {
      config.items.push(Serializer.fast(item, count))

      // sleep occasionally so the UI gets a breather
      if ((Date.now() - batch) > 1000) { // eslint-disable-line no-magic-numbers
        await sleep(0) // eslint-disable-line no-magic-numbers
        batch = Date.now()
      }

      now = Date.now()
      current_trace.prep.duration.push(now - last_trace)
      last_trace = now
    }
    current_trace.items = config.items.length
    current_trace.cached.serializer = count.cached
    if (job.path && job.canceled) {
      log.debug('export to', job.path, 'started at', job.started, 'canceled')
      return ''
    }

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

        config.cslItems[item.itemID] = Zotero.Utilities.itemToCSLJSON(item)
      }
    }

    now = Date.now()

    // if the average startup time is greater than the autoExportDelay, bump up the delay to prevent stall-cascades
    this.workers.startup += Math.ceil((now - start) / 1000) // eslint-disable-line no-magic-numbers
    // eslint-disable-next-line no-magic-numbers
    if (this.workers.total > 5 && (this.workers.startup / this.workers.total) > Preference.autoExportDelay) Preference.autoExportDelay = Math.ceil(this.workers.startup / this.workers.total)
    log.debug('worker:', { avgstartup: this.workers.startup / this.workers.total, startup: now - start, caching, workers: this.workers, autoExportDelay: Preference.autoExportDelay })

    current_trace.prep.duration.push(now - last_trace)
    current_trace.prep.total = now - start
    last_trace = now

    try {
      worker.postMessage(JSON.parse(JSON.stringify(config)))
    }
    catch (err) {
      worker.terminate()
      this.workers.running.delete(id)
      log.error(err)
      deferred.reject(err)
      log.error('QBW: failed:', Date.now() - start)
    }

    return deferred.promise
  }

  public async exportItems(translatorID: string, displayOptions: any, scope: ExportScope, path = null): Promise<string> {
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
      }
      catch (err) {
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
      }
      else {
        log.error('Translators.exportItems failed in', { time: Date.now() - start, translatorID, displayOptions, path })
        deferred.reject('translation failed')
      }
    })

    translation.translate()

    return deferred.promise
  }

  public uninstall(label) {
    try {
      const destFile = Zotero.getTranslatorsDirectory()
      destFile.append(`${label}.js`)
      if (destFile.exists()) {
        destFile.remove(false)
        return true
      }
    }
    catch (err) {
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
    }
    catch (err) {
      log.error('Translators.install', header, err)
      installed = null
    }

    header = JSON.parse(Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.json`))
    const code = [
      `ZOTERO_CONFIG = ${JSON.stringify(ZOTERO_CONFIG)}`,
      Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.js`),
    ].join('\n')

    if (installed?.configOptions?.hash === header.configOptions.hash) return false

    const cache = Cache.getCollection(header.label)
    cache.removeDataOnly()
    // importing AutoExports would be circular, so access DB directly
    const autoexports = DB.getCollection('autoexport')
    for (const ae of autoexports.find({ translatorID: header.translatorID })) {
      autoexports.update({ ...ae, status: 'scheduled' })
    }

    try {
      await Zotero.Translators.save(header, code)

    }
    catch (err) {
      log.error('Translator.install', header, 'failed:', err)
      this.uninstall(header.label)
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
    for (const pref of override.names) {
      if (typeof displayOptions[`preference_${pref}`] === 'undefined') {
        query[pref] = Preference[pref]
      }
      else {
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

    }
    else if (scope.collection) {
      sql = `SELECT i.itemID FROM collectionItems ci JOIN items i ON i.itemID = ci.itemID WHERE ci.collectionID = ${scope.collection.id} AND ${cond}`

    }
    else {
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

  public init(_request) {
    try {
      return [ OK, 'application/json', JSON.stringify(trace) ]

    }
    catch (err) {
      return [SERVER_ERROR, 'text/plain', `${err}`]
    }
  }
}
