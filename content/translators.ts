/* eslint-disable no-case-declarations, @typescript-eslint/no-unsafe-return */

Components.utils.import('resource://gre/modules/Services.jsm')

declare class ChromeWorker extends Worker { }

Components.utils.import('resource://zotero/config.js')
declare const ZOTERO_CONFIG: any

import { Deferred } from './deferred'
import type { Translators as Translator } from '../typings/translators'
import { Preference } from '../gen/preferences'
import { schema } from '../gen/preferences/meta'
import { Serializer } from './serializer'
import { log } from './logger'
import { DB as Cache, selector as cacheSelector } from './db/cache'
import { DB } from './db/main'
import { sleep } from './sleep'
import { flash } from './flash'
import { $and, Query } from './db/loki'
import { Events } from './events'
import { Pinger } from './ping'

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
  translate: any
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

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Translators = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public byId: Record<string, Translator.Header>
  public byName: Record<string, Translator.Header>
  public byLabel: Record<string, Translator.Header>
  public itemType: { note: number, attachment: number, annotation: number }

  private queue = new Queue

  public workers: { total: number, running: Set<string>, disabled: boolean, startup: number } = {
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
      annotation: Zotero.ItemTypes.getID('annotation') || 'NULL',
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
    if (this.workers.running.size > Preference.workersMax) {
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

    job.preferences = job.preferences || {}
    displayOptions = displayOptions || {}

    // undo override smuggling so I can pre-fetch the cache
    const cloaked_override = 'preference_'
    const cloaked_auto_export = 'auto_export_id'
    let autoExport: number
    for (const [pref, value] of Object.entries(displayOptions)) {
      if (pref.startsWith(cloaked_override)) {
        job.preferences[pref.replace(cloaked_override, '')] = (value as unknown as any)
        delete displayOptions[pref]
      }
      else if (pref === cloaked_auto_export) {
        autoExport = parseInt(value as unknown as string)
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

    const cache = caching && Cache.getCollection(translator.label)

    this.workers.total += 1
    const id = `${this.workers.total}`
    this.workers.running.add(id)

    const workerContext = Object.entries({
      version: Zotero.version,
      platform: Preference.platform,
      translator: translator.label,
      output: job.path || '',
      localeDateOrder: Zotero.BetterBibTeX.localeDateOrder,
      debugEnabled: Zotero.Debug.enabled ? 'true' : 'false',
      worker: id,
    }).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')

    const deferred = new Deferred<string>()
    let worker: ChromeWorker = null
    // WHAT IS GOING ON HERE FIREFOX?!?! A *NetworkError* for a xpi-internal resource:// URL?!
    try {
      worker = new ChromeWorker(`resource://zotero-better-bibtex/worker/zotero.js?${workerContext}`)
    }
    catch (err) {
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

    const config: Translator.Worker.Config = {
      preferences: { ...Preference.all, ...job.preferences },
      options: displayOptions || {},
      items: [],
      collections: [],
      cslItems: {},
      cache: {},
      autoExport,
    }

    const selector = cacheSelector(translator.label, config.options, config.preferences)

    let items: any[] = []
    worker.onmessage = (e: { data: Translator.Worker.Message }) => {
      switch (e.data?.kind) {
        case 'error':
          log.status({error: true, translator: translator.label, worker: id}, 'QBW failed:', Date.now() - start, e.data)
          job.translate._runHandler('error', e.data) // eslint-disable-line no-underscore-dangle
          deferred.reject(e.data.message)
          worker.terminate()
          this.workers.running.delete(id)
          break

        case 'debug':
          // this is pre-formatted
          Zotero.debug(e.data.message)
          break

        case 'item':
          job.translate._runHandler('itemDone', items[e.data.item]) // eslint-disable-line no-underscore-dangle
          break

        case 'done':
          Events.emit('export-progress', 100, translator.label, autoExport) // eslint-disable-line no-magic-numbers
          deferred.resolve(typeof e.data.output === 'boolean' ? '' : e.data.output)
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

          const query = {...selector, itemID}
          let cached = cache.findOne($and(query))

          if (cached) {
            // this should not happen?
            log.debug('unexpected cache store:', query)
            cached.reference = reference
            cached.metadata = metadata
            cached = cache.update(cached)

          }
          else {
            cache.insert({...query, reference, metadata})
          }
          break

        case 'progress':
          Events.emit('export-progress', e.data.percent, e.data.translator, e.data.autoExport)
          break

        default:
          if (JSON.stringify(e) !== '{"isTrusted":true}') { // why are we getting this?
            log.status({translator: translator.label, worker: id}, 'enexpected message from worker', e)
          }
          break
      }
    }

    worker.onerror = e => {
      log.status({error: true, translator: translator.label, worker: id}, 'QBW: failed:', Date.now() - start, 'message:', e)
      job.translate._runHandler('error', e) // eslint-disable-line no-underscore-dangle
      deferred.reject(e.message)
      worker.terminate()
      this.workers.running.delete(id)
    }

    const scope = this.exportScope(job.scope)
    log.debug('export scope:', scope)
    let collections: any[] = []
    switch (scope.type) {
      case 'library':
        items = await Zotero.Items.getAll(scope.id, true)
        collections = Zotero.Collections.getByLibrary(scope.id) // , true)
        log.debug('library export, got', collections.length, 'collections')
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
    items = items.filter(item => !item.isAnnotation?.())

    let worked = Date.now()
    config.items = []
    const prepare = new Pinger({
      total: items.length * (translator.label.includes('CSL') ? 2 : 1),
      callback: pct => Events.emit('export-progress', -pct, translator.label, autoExport),
    })
    log.debug('cache-rate: starting prep')
    // use a loop instead of map so we can await for beachball protection
    for (const item of items) {
      config.items.push(Serializer.fast(item))

      // sleep occasionally so the UI gets a breather
      if ((Date.now() - worked) > 100) { // eslint-disable-line no-magic-numbers
        await sleep(0) // eslint-disable-line no-magic-numbers
        worked = Date.now()
      }

      prepare.update()
    }
    if (job.path && job.canceled) {
      log.debug('export to', job.path, 'started at', job.started, 'canceled')
      return ''
    }
    log.debug('cache-rate: prep done')

    if (this.byId[translatorID].configOptions?.getCollections) {
      config.collections = collections.map(collection => {
        collection = collection.serialize(true)
        collection.id = collection.primary.collectionID
        collection.name = collection.fields.name
        return collection
      })
    }

    // pre-fetch cache
    log.debug('cache-rate: load cache')
    if (cache) {
      const query = {...selector, itemID: { $in: config.items.map(item => item.itemID) }}

      // not safe in async!
      const cloneObjects = cache.cloneObjects
      // uncloned is safe because it gets serialized in the transfer
      cache.cloneObjects = false
      config.cache = cache.find($and(query)).reduce((acc, cached) => {
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
        if (!config.cache[item.itemID]) config.cslItems[item.itemID] = Zotero.Utilities.itemToCSLJSON(item)
        prepare.update()
      }
    }
    prepare.done()
    log.debug('cache-rate: cache loaded')

    // if the average startup time is greater than the autoExportDelay, bump up the delay to prevent stall-cascades
    this.workers.startup += Math.ceil((Date.now() - start) / 1000) // eslint-disable-line no-magic-numbers
    // eslint-disable-next-line no-magic-numbers
    if (this.workers.total > 5 && (this.workers.startup / this.workers.total) > Preference.autoExportDelay) Preference.autoExportDelay = Math.ceil(this.workers.startup / this.workers.total)

    log.debug('worker: kicking off')
    worker.postMessage({ kind: 'start', config: JSON.parse(JSON.stringify(config)) })

    return deferred.promise
  }

  public async exportItems(translatorID: string, displayOptions: any, scope: ExportScope, path: string = null): Promise<string> {
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

    if (schema.translator[header.label]?.cached) Cache.getCollection(header.label).removeDataOnly()

    // importing AutoExports would be circular, so access DB directly
    const autoexports = DB.getCollection('autoexport')
    for (const ae of autoexports.find($and({ translatorID: header.translatorID }))) {
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
    if (!cache) return []

    const query: Query = {$and: [
      { exportNotes: {$eq: !!displayOptions.exportNotes} },
      { useJournalAbbreviation: {$eq: !!displayOptions.useJournalAbbreviation} },
    ]}
    for (const pref of schema.translator[this.byId[translatorID].label].preferences) {
      if (typeof displayOptions[`preference_${pref}`] === 'undefined') {
        query.$and.push({ [pref]: {$eq: Preference[pref]} })
      }
      else {
        query.$and.push({ [pref]: {$eq: displayOptions[`preference_${pref}`]} })
      }
    }
    const cached = new Set(cache.find(query).map(item => item.itemID))

    if (scope.items) {
      return scope.items.filter(item => !cached.has(item.id))
    }

    let sql: string = null
    const cond = `i.itemTypeID NOT IN (${this.itemType.note}, ${this.itemType.attachment}, ${this.itemType.annotation}) AND i.itemID NOT IN (SELECT itemID FROM deletedItems)`
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
