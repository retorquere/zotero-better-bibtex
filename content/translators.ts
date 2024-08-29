/* eslint-disable no-case-declarations, @typescript-eslint/no-unsafe-return */

import { Shim } from './os'
import * as client from './client'
const $OS = client.is7 ? Shim : OS
import merge from 'lodash.merge'
import { Cache } from './db/cache'

/*
async function guard(run: Promise<void>): Promise<boolean> {
  let timeout = true

  const delay = async () => {
    await Zotero.Promise.delay(20000)
    if (timeout) {
      log.error('installing translators: raced to timeout!')
      throw { timeout: true, message: 'timeout' } // eslint-disable-line no-throw-literal
    }
  }

  try {
    await Promise.race([run, delay()])
    timeout = false
    log.info('installing translators: guard OK')
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
import { affects, Preferences } from '../gen/preferences/meta'
import { log } from './logger'
import { flash } from './flash'
import { Events } from './events'
import { Pinger } from './ping'
import { newQueue } from '@henrygd/queue'
import { orchestrator } from './orchestrator'
import type { Reason } from './bootstrap'
import { headers as Headers, byLabel, byId, bySlug } from '../gen/translators'

Events.on('preference-changed', async (pref: string) => {
  for (const translator of (affects[pref] || [])) {
    await Cache.clear(translator)
  }
})

import * as l10n from './l10n'

class TimeoutError extends Error {
  timeout: number

  constructor(message: string, { timeout }: { timeout: number }) {
    super(message)
    this.timeout = timeout
  }
}

type ExportScope = { type: 'items'; items: any[] } | { type: 'library'; id: number } | { type: 'collection'; collection: any }
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
  public itemType: { note: number; attachment: number; annotation: number }
  public queue = newQueue(1)
  public worker: ChromeWorker

  private reinit: { header: Translator.Header; code: string }[]

  constructor() {
    const ready = Zotero.Promise.defer()

    Object.assign(this, { byLabel, byId, bySlug })

    orchestrator.add({
      id: 'translators',
      description: 'translators',
      needs: [ 'keymanager', 'cache' ],
      startup: async () => {
        if (!this.worker) {
          try {
            const searchParams = Object.entries(client)
              .map(([ k, v ]) => `${ encodeURIComponent(k) }=${ encodeURIComponent(`${v}`) }`).join('&')

            this.worker = new ChromeWorker(`chrome://zotero-better-bibtex/content/worker/zotero.js?${ searchParams }`)

            // post dynamically to fix #2485
            this.worker.postMessage({
              kind: 'initialize',
              CSL_MAPPINGS: Object.entries(Zotero.Schema).reduce((acc, [ k, v ]) => { if (k.startsWith('CSL')) acc[k] = v; return acc }, {}),
            })
          }
          catch (err) {
            log.error('translate: worker not acquired', err)
            if (Preference.testing) throw err

            flash(
              'Failed to start background export',
              `Could not start background export (${ err.message }). Background exports have been disabled until restart -- report this as a bug at the Better BibTeX github project`,
              15
            )
            this.worker = null
          }
        }

        this.itemType = {
          note: Zotero.ItemTypes.getID('note'),
          attachment: Zotero.ItemTypes.getID('attachment'),
          annotation: Zotero.ItemTypes.getID('annotation') || 'NULL',
        }

        // cleanup old translators
        this.uninstall('Better BibTeX Quick Copy')
        this.uninstall('\u672B BetterBibTeX JSON (for debugging)')
        this.uninstall('BetterBibTeX JSON (for debugging)')

        await this.installTranslators()

        ready.resolve(true)
      },
      shutdown: async (reason: Reason) => {
        if (Cache.opened) await Cache.ZoteroSerialized.purge()

        switch (reason) {
          case 'ADDON_DISABLE':
          case 'ADDON_UNINSTALL':
            break
          default:
            return
        }

        const quickCopy = Zotero.Prefs.get('export.quickCopy.setting')
        for (const header of Headers) {
          if (quickCopy === `export=${ header.translatorID }`) Zotero.Prefs.clear('export.quickCopy.setting')

          try {
            Translators.uninstall(header.label)
          }
          catch {}
        }

        await Zotero.Translators.reinit()
      },
    })
  }

  public getTranslatorId(name: string): string {
    const name_lc = name.toLowerCase().replace(/ /g, '')

    // shortcuts
    switch (name_lc) {
      case 'json':
        return this.bySlug.BetterCSLJSON.translatorID
      case 'yaml':
        return this.bySlug.BetterCSLYAML.translatorID
      case 'jzon':
        return this.bySlug.BetterBibTeXJSON.translatorID
      case 'bib':
      case 'biblatex':
        return this.bySlug.BetterBibLaTeX.translatorID
      case 'bibtex':
        return this.bySlug.BetterBibTeX.translatorID
    }

    for (const [ id, translator ] of (Object.entries(this.byId))) {
      if (name_lc === translator.label.toLowerCase().replace(/ /g, '') && [ 'yaml', 'json', 'bib' ].includes(translator.target)) return id
    }

    if (typeof name === 'string' && name.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}?$/)) return name

    throw new Error(`getTranslatorId: ${ JSON.stringify(name) } could not be resolved to a translator`)
  }

  public async importString(str) {
    await Zotero.BetterBibTeX.ready
    const translation = new Zotero.Translate.Import
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
    return await this.queue.add(() => this.exportItemsByWorker(job))
  }

  private async exportItemsByWorker(job: ExportJob): Promise<string> {
    // trace('exportItemsByWorker: requested')
    if (job.path && job.canceled) return ''
    await Zotero.BetterBibTeX.ready
    if (job.path && job.canceled) return ''

    // trace('exportItemsByWorker: preparing')
    const displayOptions = {
      ...this.displayOptions(job.translatorID, job.displayOptions),
      exportPath: job.path || undefined,
      exportDir: job.path ? $OS.Path.dirname(job.path) : undefined,
    }

    if (job.translate) {
      // fake out the stuff that complete expects to be set by .translate
      job.translate._currentState = 'translate' // eslint-disable-line no-underscore-dangle
      job.translate.saveQueue = []
      job.translate._savingAttachments = [] // eslint-disable-line no-underscore-dangle
    }

    const translator = this.byId[job.translatorID]

    const start = Date.now()

    const preferences = job.preferences || {}

    const deferred = Zotero.Promise.defer()

    const config: Translator.Worker.Job = {
      preferences: { ...Preference.all, ...preferences },
      options: displayOptions,
      data: {
        items: [],
        collections: [],
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
          log.error(`translation failed: ${ e.data.message }\n${ e.data.stack || '' }`.trim())
          if (job.translate) {
            // job.translate._runHandler('error', e.data) // eslint-disable-line no-underscore-dangle
            job.translate.complete(false, { message: e.data.message, stack: e.data.stack })
          }
          deferred.reject(new Error(e.data.message))
          break

        case 'debug':
          // this is pre-formatted
          Zotero.debug(e.data.message) // eslint-disable-line no-restricted-syntax
          break

        case 'item':
          job.translate?._runHandler('itemDone', items[e.data.item]) // eslint-disable-line no-underscore-dangle
          break

        case 'done':
          void Events.emit('export-progress', { pct: 100, message: translator.label, ae: job.autoExport })
          if (job.translate) {
            job.translate.string = e.data.output // eslint-disable-line id-blacklist
            job.translate.complete(e.data.output)
          }
          deferred.resolve(e.data.output)
          break

        case 'progress':
          void Events.emit('export-progress', { pct: e.data.percent, message: e.data.translator, ae: e.data.autoExport })
          break

        default:
          if (JSON.stringify(e) !== '{"isTrusted":true}') { // why are we getting this?
            log.status({ error: true }, 'unexpected message from worker', e)
          }
          break
      }
    }

    this.worker.onerror = e => {
      log.error('QBW: failed:', Date.now() - start, 'message:', e)
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
        throw new Error(`Unexpected scope: ${ Object.keys(scope) }`)
    }
    if (job.path && job.canceled) return ''

    items = items.filter(item => !item.isAnnotation?.())

    const prepare = new Pinger({
      total: items.length,
      callback: pct => {
        let preparing = `${ l10n.localize('better-bibtex_preferences_auto-export_status_preparing') } ${ translator.label }`.trim()
        if (this.queue.size()) preparing += ` +${ this.queue.size() }`
        void Events.emit('export-progress', { pct, message: preparing, ae: job.autoExport })
      },
    })

    // trace('exportItemsByWorker: starting cache completion')
    await Cache.ZoteroSerialized.fill(items)
    // trace('exportItemsByWorker: cache completion completed')

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

    prepare.done()

    // trace('exportItemsByWorker: prepare finished')
    this.worker.postMessage({ kind: 'start', config })

    if (typeof job.timeout === 'number') {
      Zotero.Promise.delay(job.timeout * 1000).then(() => {
        const err = new TimeoutError(`translation timeout after ${ job.timeout } seconds`, { timeout: job.timeout })
        log.error('translation.exportItems:', err)
        deferred.reject(err)
      })
    }

    return deferred.promise
  }

  public displayOptions(translatorID: string, displayOptions: any): any {
    return merge({}, this.byId[translatorID]?.displayOptions || {}, displayOptions)
  }

  public async exportItems(job: ExportJob): Promise<string> {
    await Zotero.BetterBibTeX.ready

    const displayOptions = this.displayOptions(job.translatorID, job.displayOptions)

    const translator = this.byId[job.translatorID]
    if (typeof translator?.displayOptions.worker === 'boolean' && displayOptions.worker) {
      return await this.queueJob(job)
    }

    const translation = new Zotero.Translate.Export

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
        throw new Error(`Unexpected scope: ${ Object.keys(scope) }`)
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

      if (!file) throw new Error(l10n.localize('better-bibtex_translate_error_target_not_a_file', { path: job.path }))

      // the parent directory could have been removed
      if (!file.parent || !file.parent.exists()) throw new Error(l10n.localize('better-bibtex_translate_error_target_no_parent', { path: job.path }))

      translation.setLocation(file)
    }

    let finished = false
    const work: Array<Promise<void>> = [
      translation.translate(),
    ]

    if (typeof job.timeout === 'number') {
      const timeout = async () => {
        await Zotero.Promise.delay(job.timeout * 1000)
        if (!finished) {
          const err = new TimeoutError(`translation timeout after ${ job.timeout } seconds`, { timeout: job.timeout })
          log.error(err)
          throw err
        }
      }
      work.push(timeout())
    }

    await Promise.race(work)
    finished = true
    return translation.string
  }

  public uninstall(label) {
    try {
      const destFile = Zotero.getTranslatorsDirectory()
      destFile.append(`${ label }.js`)
      if (destFile.exists()) {
        destFile.remove(false)
        return true
      }
    }
    catch (err) {
      log.error(`Translators.uninstall: failed to remove ${ label }:`, err)
      return true
    }

    return false
  }

  public async needsInstall(): Promise<{ header: Translator.Header; code: string }[]> {
    if (!this.reinit) {
      const reinit: Record<string, { header: Translator.Header; code: string }> = {}

      const code = (label: string) => [
        `ZOTERO_CONFIG = ${ JSON.stringify(ZOTERO_CONFIG) }`,
        Zotero.File.getContentsFromURL(`chrome://zotero-better-bibtex/content/resource/${ label }.js`),
      ].join('\n')

      const headers: Translator.Header[] = Headers
        .map(header => JSON.parse(Zotero.File.getContentsFromURL(`chrome://zotero-better-bibtex/content/resource/${ header.label }.json`)))

      const filenames = headers.map(header => `'${ header.label }.js'`).join(',')
      const installed: Record<string, Translator.Header> = {}
      for (const { fileName, metadataJSON } of (await Zotero.DB.queryAsync(`SELECT fileName, metadataJSON FROM translatorCache WHERE fileName IN (${ filenames })`))) {
        try {
          installed[fileName.replace(/[.]js$/, '')] = JSON.parse(metadataJSON)
        }
        catch {
          log.error('translator install: failed to parse header for', fileName, ':', metadataJSON)
        }
      }

      for (const header of headers) {
        // workaround for mem limitations on Windows
        if (!client.is7 && typeof header.displayOptions?.worker === 'boolean') header.displayOptions.worker = !!Zotero.isWin

        const existing = installed[header.label]
        if (!existing) {
          reinit[header.label] = { header, code: code(header.label) }
          log.info(`translator install: new translator ${ header.label }`)
        }
        else if (existing.configOptions?.hash !== header.configOptions.hash) {
          reinit[header.label] = { header, code: code(header.label) }
          log.info(`translator install: updated translator ${ header.label }`)
        }
      }

      this.reinit = Object.values(reinit)
    }

    return this.reinit
  }

  private async installTranslators() {
    const install = await this.needsInstall()
    if (!install.length) return

    for (const { header, code } of install) {
      await Zotero.DB.queryTx('UPDATE betterbibtex.autoExport SET status = \'scheduled\' WHERE translatorID = ?', [header.translatorID])
      await Cache.clear(header.label)
      await Zotero.Translators.save(header, code)
    }

    await Zotero.Translators.reinit()
  }

  private exportScope(scope: ExportScope): ExportScope {
    if (!scope) scope = { type: 'library', id: Zotero.Libraries.userLibraryID }

    if (scope.type === 'collection' && typeof scope.collection === 'number') {
      return { type: 'collection', collection: Zotero.Collections.get(scope.collection) }
    }

    switch (scope.type) {
      case 'items':
        if (!scope.items?.length) throw new Error(`invalid scope: ${ JSON.stringify(scope) }`)
        break
      case 'collection':
        if (typeof scope.collection?.id !== 'number') throw new Error(`invalid scope: ${ JSON.stringify(scope) }`)
        break
      case 'library':
        if (typeof scope.id !== 'number') throw new Error(`invalid scope: ${ JSON.stringify(scope) }`)
        break
      default:
        throw new Error(`invalid scope: ${ JSON.stringify(scope) }`)
    }

    return scope
  }
}
