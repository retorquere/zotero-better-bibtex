/* eslint-disable no-case-declarations, @typescript-eslint/no-unsafe-return */

import { Shim } from './os'
import { is7 } from './client'
const $OS = is7 ? Shim : OS
import merge from 'lodash.merge'
import { cache as IndexedCache } from './db/indexed'

/*
async function guard(run: Promise<void>): Promise<boolean> {
  let timeout = true

  const delay = async () => {
    await Zotero.Promise.delay(20000)
    if (timeout) {
      log.debug('installing translators: raced to timeout!')
      throw { timeout: true, message: 'timeout' } // eslint-disable-line no-throw-literal
    }
  }

  try {
    await Promise.race([run, delay()])
    timeout = false
    log.debug('installing translators: guard OK')
    return true
  }
  catch (err) {
    log.error('installing translators: guard failed because of', err.message )
    if (err.timeout) return false
    throw err
  }
}
*/

Components.utils.import('resource://gre/modules/Services.jsm')

declare class ChromeWorker extends Worker { }

Components.utils.import('resource://zotero/config.js')
declare const ZOTERO_CONFIG: any

import type { Translators as Translator } from '../typings/translators'
import { Preference } from './prefs'
import { Preferences, affectedBy } from '../gen/preferences/meta'
import { log } from './logger'
import { DB as Cache } from './db/cache'
import { flash } from './flash'
import { $and } from './db/loki'
import { Events } from './events'
import { Pinger } from './ping'
import Puqeue from 'puqeue'
import { orchestrator } from './orchestrator'
import type { Reason } from './bootstrap'
import type Bluebird from 'bluebird'
import { headers as Headers, byLabel, byId, bySlug } from '../gen/translators'

class Queue extends Puqeue {
  get queued() {
    return this._queue.length
  }
}

import * as l10n from './l10n'

class TimeoutError extends Error {
  timeout: number

  constructor(message: string, { timeout }: { timeout: number }) {
    super(message)
    this.timeout = timeout
  }
}

type ExportScope = { type: 'items', items: any[] } | { type: 'library', id: number } | { type: 'collection', collection: any }
export type ExportJob = {
  translatorID: string
  displayOptions: Record<string, boolean>
  scope: ExportScope
  autoExport?: string
  preferences?: Partial<Preferences>
  path?: string
  started?: number
  canceled?: boolean
  translate?: any
  timeout?: number
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Translators = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public byId: Record<string, Translator.Header> = {}
  public byLabel: Record<string, Translator.Header> = {}
  public bySlug: Record<string, Translator.Header> = {}
  public itemType: { note: number, attachment: number, annotation: number }
  public queue = new Queue
  public worker: ChromeWorker

  public ready!: Bluebird<boolean>

  constructor() {
    const ready = Zotero.Promise.defer()
    this.ready = ready.promise

    Object.assign(this, { byLabel, byId, bySlug })

    orchestrator.add({
      id: 'translators',
      description: 'translators',
      needs: ['keymanager', 'cache'],
      startup: async () => {
        if (!this.worker) {
          try {
            const environment = Object.entries({
              version: Zotero.version,
              platform: Preference.platform,
              locale: Zotero.locale,
              clientName: Zotero.clientName,
              is7,
            }).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')

            this.worker = new ChromeWorker(`chrome://zotero-better-bibtex/content/worker/zotero.js?${environment}`)

            // post dynamically to fix #2485
            this.worker.postMessage({
              kind: 'initialize',
              CSL_MAPPINGS: Object.entries(Zotero.Schema).reduce((acc, [k, v]) => { if (k.startsWith('CSL')) acc[k] = v; return acc}, {}),
            })
          }
          catch (err) {
            log.error('translate: worker not acquired', err)
            if (Preference.testing) throw err

            flash(
              'Failed to start background export',
              `Could not start background export (${err.message}). Background exports have been disabled until restart -- report this as a bug at the Better BibTeX github project`,
              15
            )
            this.worker = null
          }
        }
        log.debug('translators startup: worker started')

        this.itemType = {
          note: Zotero.ItemTypes.getID('note'),
          attachment: Zotero.ItemTypes.getID('attachment'),
          annotation: Zotero.ItemTypes.getID('annotation') || 'NULL',
        }

        // cleanup old translators
        this.uninstall('Better BibTeX Quick Copy')
        this.uninstall('\u672B BetterBibTeX JSON (for debugging)')
        this.uninstall('BetterBibTeX JSON (for debugging)')
        log.debug('translators startup: cleaned')

        await this.installTranslators()

        log.debug('translators startup: finished')
        ready.resolve(true)
        log.debug('translators startup: released')
      },
      shutdown: async (reason: Reason) => {
        if (IndexedCache.opened) await IndexedCache.ZoteroExportFormat.purge()

        switch (reason) {
          case 'ADDON_DISABLE':
          case 'ADDON_UNINSTALL':
            break
          default:
            return
        }

        const quickCopy = Zotero.Prefs.get('export.quickCopy.setting')
        for (const header of Headers) {
          if (quickCopy === `export=${header.translatorID}`) Zotero.Prefs.clear('export.quickCopy.setting')

          try {
            Translators.uninstall(header.label)
          }
          catch (error) {}
        }

        await Zotero.Translators.reinit()
      },
    })
  }

  public getTranslatorId(name: string): string {
    Zotero.debug(`getTranslatorId: resolving ${JSON.stringify(name)}`)
    const name_lc = name.toLowerCase().replace(/ /g, '')

    // shortcuts
    switch (name_lc) {
      case 'json':
        return Translators.bySlug.BetterCSLJSON.translatorID
      case 'yaml':
        return Translators.bySlug.BetterCSLYAML.translatorID
      case 'jzon':
        return Translators.bySlug.BetterBibTeXJSON.translatorID
      case 'bib':
      case 'biblatex':
        return Translators.bySlug.BetterBibLaTeX.translatorID
      case 'bibtex':
        return Translators.bySlug.BetterBibTeX.translatorID
    }

    for (const [id, translator] of (Object.entries(this.byId))) {
      if (name_lc === translator.label.toLowerCase().replace(/ /g, '') && ['yaml', 'json', 'bib'].includes(translator.target)) return id
    }

    if (typeof name !== 'string' || !name.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}?$/)) {
      Zotero.debug(`getTranslatorId: ${JSON.stringify(name)} is not a GUID`)
      throw new Error(`getTranslatorId: ${JSON.stringify(name)} is not a GUID`)
    }

    return name
  }

  public async importString(str) {
    await this.ready
    await Zotero.initializationPromise // this really shouldn't be necessary
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

  public async queueJob(job: ExportJob): Promise<string> {
    return this.queue.add(() => this.exportItemsByQueuedWorker(job))
  }

  private async exportItemsByQueuedWorker(job: ExportJob) {
    if (job.path && job.canceled) return ''
    await Zotero.BetterBibTeX.ready
    if (job.path && job.canceled) return ''

    const displayOptions = {
      ...this.displayOptions(job.translatorID, job.displayOptions),
      exportPath: job.path || undefined,
      exportDir: job.path ? $OS.Path.dirname(job.path) : undefined,
    }

    const translator = this.byId[job.translatorID]

    const start = Date.now()

    const preferences = job.preferences || {}

    const cache = Preference.cache && !(
      // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
      displayOptions.exportFileData

      // jabref 4 stores collection info inside the entry, and collection info depends on which part of your library you're exporting
      || (translator.label.includes('TeX') && preferences.jabrefFormat >= 4)

      // relative file paths are going to be different based on the file being exported to
      || preferences.relativeFilePaths
    ) && Cache.getCollection(translator.label)

    const deferred = Zotero.Promise.defer()

    const config: Translator.Worker.Job = {
      preferences: { ...Preference.all, ...preferences },
      options: displayOptions,
      data: {
        items: [],
        collections: [],
        cache: {},
      },
      autoExport: job.autoExport,

      translator: translator.label,
      output: job.path || '',
      debugEnabled: !!Zotero.Debug.storing,
    }

    let items: any[] = []
    this.worker.onmessage = (e: { data: Translator.Worker.Message }) => {
      switch (e.data?.kind) {
        case 'error':
          log.status({error: true}, 'QBW failed:', Date.now() - start, e.data)
          job.translate?._runHandler('error', e.data) // eslint-disable-line no-underscore-dangle
          deferred.reject(new Error(e.data.message))
          break

        case 'debug':
          // this is pre-formatted
          Zotero.debug(e.data.message)
          break

        case 'item':
          job.translate?._runHandler('itemDone', items[e.data.item]) // eslint-disable-line no-underscore-dangle
          break

        case 'done':
          void Events.emit('export-progress', { pct: 100, message: translator.label, ae: job.autoExport })
          deferred.resolve(typeof e.data.output === 'boolean' ? '' : e.data.output)
          break

        case 'cache':
          let { itemID, entry, metadata } = e.data
          if (!metadata) metadata = {}
          Cache.store(translator.label, itemID, config.options, config.preferences, entry, metadata)
          break

        case 'progress':
          void Events.emit('export-progress', { pct: e.data.percent, message: e.data.translator, ae: e.data.autoExport })
          break

        default:
          if (JSON.stringify(e) !== '{"isTrusted":true}') { // why are we getting this?
            log.status({error: true}, 'unexpected message from worker', e)
          }
          break
      }
    }

    this.worker.onerror = e => {
      log.status({error: true}, 'QBW: failed:', Date.now() - start, 'message:', e)
      job.translate?._runHandler('error', e) // eslint-disable-line no-underscore-dangle
      deferred.reject(new Error(e.message))
    }

    const scope = this.exportScope(job.scope)
    let collections: any[] = []
    switch (scope.type) {
      case 'library':
        items = await Zotero.Items.getAll(scope.id, true)
        collections = Zotero.Collections.getByLibrary(scope.id) // , true)
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
    if (job.path && job.canceled) return ''

    items = items.filter(item => !item.isAnnotation?.())

    const prepare = new Pinger({
      total: items.length,
      callback: pct => {
        let preparing = `${l10n.localize('better-bibtex_preferences_auto-export_status_preparing')} ${translator.label}`.trim()
        if (this.queue.queued) preparing += ` +${Translators.queue.queued}`
        void Events.emit('export-progress', { pct, message: preparing, ae: job.autoExport })
      },
    })

    log.debug('indexed: pre-translation fill of', items.map(item => [Zotero.ItemTypes.getName(item.itemTypeID), item.id]))
    // maybe use a loop instead of map so we can await for beachball protection
    await IndexedCache.ZoteroExportFormat.fill(items)
    config.data.items = items.map(item => item.id)
    prepare.update()
    if (job.path && job.canceled) return ''

    if (this.byId[job.translatorID].configOptions?.getCollections) {
      config.data.collections = collections.map(collection => {
        collection = collection.serialize(true)
        collection.id = collection.primary.collectionID
        collection.name = collection.fields.name
        return collection
      })
    }

    // pre-fetch cache
    if (cache) {
      const selector = translator.configOptions?.cached ? Cache.selector(translator.label, config.options, config.preferences) : null
      const query = {...selector, itemID: { $in: config.data.items }}

      // not safe in async!
      const cloneObjects = cache.cloneObjects
      // uncloned is safe because it gets serialized in the transfer
      cache.cloneObjects = false
      config.data.cache = cache.find($and(query)).reduce((acc, cached) => {
        // direct-DB access for speed...
        cached.meta.updated = (new Date).getTime() // touches the cache object so it isn't reaped too early
        acc[cached.itemID] = cached
        return acc
      }, {})
      cache.cloneObjects = cloneObjects
      cache.dirty = true
    }

    prepare.done()

    const enc = new TextEncoder()
    // stringify gets around 'object could not be cloned', and arraybuffers can be passed zero-copy. win-win
    const abconfig = enc.encode(JSON.stringify(config)).buffer

    this.worker.postMessage({ kind: 'start', config: abconfig }, [ abconfig ])

    if (typeof job.timeout === 'number') {
      Zotero.Promise.delay(job.timeout * 1000).then(() => {
        const err = new TimeoutError(`translation timeout after ${job.timeout} seconds`, { timeout: job.timeout })
        log.error('translation.exportItems:', err)
        deferred.reject(err)
      })
    }

    return deferred.promise
  }

  public displayOptions(translatorID: string, displayOptions: any): any {
    return merge(
      {},
      this.byId[translatorID]?.displayOptions || {},
      displayOptions,
      this.byId[translatorID].label === 'BetterBibTeX JSON' ? { exportCharset: 'UTF-8xBOM' } : {}
    )
  }

  public async exportItems(job: ExportJob): Promise<string> {
    await Zotero.BetterBibTeX.ready
    await this.ready

    const displayOptions = this.displayOptions(job.translatorID, job.displayOptions)

    const start = Date.now()

    const deferred = Zotero.Promise.defer()
    const translation = new Zotero.Translate.Export()

    const scope = this.exportScope(job.scope)

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

    translation.setTranslator(job.translatorID)
    if (Object.keys(displayOptions).length !== 0) translation.setDisplayOptions(displayOptions)

    if (job.path) {
      let file = null

      try {
        file = Zotero.File.pathToFile(job.path)
        // path could exist but not be a regular file
        if (file.exists() && !file.isFile()) file = null
      }
      catch (err) {
        // or Zotero.File.pathToFile could have thrown an error
        log.error('Translators.exportItems:', err)
        file = null
      }
      if (!file) {
        deferred.reject(new Error(l10n.localize('better-bibtex_translate_error_target_not_a_file', { path: job.path })))
        return deferred.promise
      }

      // the parent directory could have been removed
      if (!file.parent || !file.parent.exists()) {
        deferred.reject(new Error(l10n.localize('better-bibtex_translate_error_target_no_parent', { path: job.path })))
        return deferred.promise
      }

      translation.setLocation(file)
    }

    translation.setHandler('done', (obj, success) => {
      if (success) {
        deferred.resolve(obj ? obj.string : undefined)
      }
      else {
        log.error('error: Translators.exportItems failed in', { time: Date.now() - start, ...job, translate: undefined })
        deferred.reject(new Error('translation failed'))
      }
    })

    translation.translate()

    if (typeof job.timeout === 'number') {
      Zotero.Promise.delay(job.timeout * 1000).then(() => {
        const err = new TimeoutError(`translation timeout after ${job.timeout} seconds`, { timeout: job.timeout })
        log.error('translation.exportItems:', err)
        deferred.reject(err)
      })
    }

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

  private async installTranslators() {
    /*
    log.debug('installing translators: busy-waiting for Zotero.Translators.init()')
    while (true) { // eslint-disable-line no-constant-condition
      try {
        Zotero.Translators.get(0)
        break
      }
      catch (err) {
        if (err.message === 'Translators not yet loaded') {
          log.debug('installing translators:', err.message)
          await Zotero.Promise.delay(1000)
        }
        else {
          throw err
        }
      }
    }
    */

    // the busy-wait guarantees it has once been inited, and this just hangs for no reason for some people.
    // log.debug('installing translators: now actually waiting for Zotero.Translators.init()')
    // await Zotero.Translators.init()

    log.debug('installing translators: loading BBT translators')
    const reinit: { header: Translator.Header, code: string }[] = []
    // fetch from resource because that has the hash
    const headers: Translator.Header[] = Headers
      .map(header => JSON.parse(Zotero.File.getContentsFromURL(`chrome://zotero-better-bibtex/content/resource/${header.label}.json`)))
    let code
    for (const header of headers) {
      // workaround for mem limitations on Windows
      if (!is7 && typeof header.displayOptions?.worker === 'boolean') header.displayOptions.worker = !!Zotero.isWin
      if (code = await this.install(header)) {
        log.debug(`installing translators: scheduling ${header.label} for re-init`)
        reinit.push({ header, code })
      }
    }

    if (reinit.length) {
      log.debug(`installing translators: scheduling ${reinit.length} for re-init`)
      await Zotero.Translators.reinit()
    }
    log.debug('installing translators: done')
  }

  public async install(header: Translator.Header): Promise<string> {
    const installed = Zotero.Translators.get(header.translatorID) || null
    if (installed?.configOptions?.hash === header.configOptions.hash) return ''

    const code = [
      `ZOTERO_CONFIG = ${JSON.stringify(ZOTERO_CONFIG)}`,
      Zotero.File.getContentsFromURL(`chrome://zotero-better-bibtex/content/resource/${header.label}.js`),
    ].join('\n')

    if (header.configOptions?.cached) Cache.getCollection(header.label).removeDataOnly()

    // will be started later by the scheduler
    await Zotero.DB.queryTx("UPDATE betterbibtex.autoExport SET status = 'scheduled' WHERE translatorID = ?", [ header.translatorID ])

    try {
      await Zotero.Translators.save(header, code)
    }
    catch (err) {
      log.error('Translator.install', header, 'failed:', err)
      this.uninstall(header.label)
      return ''
    }

    return code
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

for (const header of Headers) {
  if (!header.configOptions?.cached) continue
  const preferences: Partial<Preferences> = Preference.pick(affectedBy[header.label])
  log.debug('context:', header.label, preferences)
}
