/* eslint-disable no-case-declarations, @typescript-eslint/no-unsafe-return */

import * as client from './client.js'
import merge from 'lodash.merge'
import { Cache } from './translators/worker.js'
import { serializer } from './item-export-format.js'

var ZOTERO_CONFIG: any // eslint-disable-line no-var
if (client.version[0] === '8') {
  ({ ZOTERO_CONFIG } = ChromeUtils.importESModule('resource://zotero/config.mjs'))
}
else {
  Components.utils.import('resource://zotero/config.js')
}

import { Preference } from './prefs.js'
import { affects, Preferences } from '../gen/preferences/meta.js'
import { log } from './logger.js'
import { Events } from './events.js'
import { newQueue } from '@henrygd/queue'
import { orchestrator } from './orchestrator.js'
import type { Reason } from './bootstrap.js'
import { Header, headers as Headers, byLabel, byId, bySlug } from '../gen/translators.js'
import { Job, worker, Exporter, Message } from './translators/worker.js'

Events.on('preference-changed', async (pref: string) => {
  for (const translator of (affects[pref] || [])) {
    await Cache.Exports.dropTranslator(translator)
  }
})

import * as l10n from './l10n.js'

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
export const Translators = new class {
  public byId: Record<string, Header> = {}
  public byLabel: Record<string, Header> = {}
  public bySlug: Record<string, Header> = {}
  public queue = newQueue(1)

  private reinit: { header: Header; code: string }[]

  constructor() {
    // const ready = Zotero.Promise.defer()

    Object.assign(this, { byLabel, byId, bySlug })

    orchestrator.add({
      id: 'translators',
      description: 'translators',
      needs: [ 'worker', 'keymanager' ],
      startup: async () => {
        worker.addEventListener('message', (e: MessageEvent) => {
          const data = e.data as Message
          if (!data || (data as unknown as any).id) return // data.id means it is a JSON-RPC message

          switch (data?.kind) {
            case 'debug':
              // this is pre-formatted
              Zotero.debug(e.data.message) // eslint-disable-line no-restricted-syntax
              break

            case 'progress':
              void Events.emit('export-progress', { pct: e.data.percent, message: e.data.translator, ae: e.data.autoExport })
              break
          }
        })

        // cleanup old translators
        this.uninstall('Better BibTeX Quick Copy')
        this.uninstall('\u672B BetterBibTeX JSON (for debugging)')
        this.uninstall('BetterBibTeX JSON (for debugging)')

        await this.installTranslators()

        // ready.resolve(true as unknown as void)
      },
      shutdown: async (reason: Reason) => {
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
    if (!zp.collectionsView) return

    if (!zp.collectionsView.editable) {
      await zp.collectionsView.selectLibrary()
    }

    const translators = await translation.getTranslators()

    if (!translators.length) throw new Error('No translators found')

    const libraryID = zp.getSelectedLibraryID()
    await zp.collectionsView.selectLibrary(libraryID) // TODO: zotero-types does somehow not declare this to return a promise

    translation.setTranslator(translators[0])

    await translation.translate({ libraryID })

    return translation.newItems
  }

  public async queueJob(job: ExportJob): Promise<string> {
    return await this.queue.add(() => this.exportItems(job))
  }

  private async exportItemsByWorker(job: ExportJob): Promise<string> {
    if (job.path && job.canceled) return ''
    await Zotero.BetterBibTeX.ready
    if (job.path && job.canceled) return ''

    const displayOptions = {
      ...this.displayOptions(job.translatorID, job.displayOptions),
      exportPath: job.path || undefined,
      exportDir: job.path ? PathUtils.parent(job.path) : undefined,
    }

    if (job.translate) {
      // fake out the stuff that complete expects to be set by .translate
      job.translate._currentState = 'translate' // eslint-disable-line no-underscore-dangle
      job.translate.saveQueue = []
      job.translate._savingAttachments = [] // eslint-disable-line no-underscore-dangle
    }

    const translator = this.byId[job.translatorID]

    const preferences = job.preferences || {}

    const config: Job = {
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

    items = items.filter(item => !item.isAnnotation() && !item.isFeedItem && (item.isRegularItem() || item.isNote() || item.isAttachment()))
    const missing = new Set(await Cache.Serialized.missing(items.map(item => item.id)))
    log.info('json-rpc: cache fill', missing.size, '/', items.length)
    await Cache.Serialized.fill(await serializer.serialize(items.filter(item => missing.has(item.id))))

    config.data.items = items.map(item => item.id)
    if (job.path && job.canceled) return ''

    if (this.byId[job.translatorID].configOptions?.getCollections) {
      config.data.collections = collections.map(collection => {
        collection = collection.serialize(true)
        collection.id = collection.primary.collectionID
        collection.name = collection.fields.name
        return collection
      })
    }

    try {
      const { cacheRate, output } = await Exporter.start(config)
      log.info(`json-rpc: export cache use ${cacheRate}%`)
      if (job.autoExport) Cache.rate[job.autoExport] = cacheRate

      if (job.translate) {
        job.translate.string = output // eslint-disable-line id-blacklist
        job.translate.complete(output)
      }
      return output
    }
    catch (err) {
      log.error('translation failed:', err)
      if (job.translate) job.translate.complete(false, err)
    }
  }

  public displayOptions(translatorID: string, displayOptions: any): any {
    const defaults = this.byId[translatorID]?.displayOptions || {}
    return merge({}, defaults, displayOptions)
  }

  public async exportItems(job: ExportJob): Promise<string> {
    await Zotero.BetterBibTeX.ready

    const translator = this.byId[job.translatorID]
    const displayOptions = this.displayOptions(job.translatorID, job.displayOptions)
    if (translator && displayOptions.worker) return await this.exportItemsByWorker(job)

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
      log.error(`Translators.uninstall: failed to remove ${label}:`, err)
      return true
    }

    return false
  }

  public async needsInstall(): Promise<{ header: Header; code: string }[]> {
    if (!this.reinit) {
      const reinit: Record<string, { header: Header; code: string }> = {}

      const code = (label: string) => [
        `if (typeof ZOTERO_CONFIG === 'undefined') ZOTERO_CONFIG = ${JSON.stringify(ZOTERO_CONFIG)}`,
        Zotero.File.getContentsFromURL(`chrome://zotero-better-bibtex/content/resource/${ label }.js`),
      ].join('\n')

      const headers: Header[] = Headers
        .map(header => JSON.parse(Zotero.File.getContentsFromURL(`chrome://zotero-better-bibtex/content/resource/${ header.label }.json`)))

      const filenames = headers.map(header => `'${ header.label }.js'`).join(',')
      const installed: Record<string, Header> = {}
      for (const { fileName, metadataJSON } of (await Zotero.DB.queryAsync(`SELECT fileName, metadataJSON FROM translatorCache WHERE fileName IN (${ filenames })`))) {
        try {
          installed[fileName.replace(/[.]js$/, '')] = JSON.parse(metadataJSON)
        }
        catch {
          log.error('translator install: failed to parse header for', fileName, ':', metadataJSON)
        }
      }

      for (const header of headers) {
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
      await Cache.Exports.dropTranslator(header.label)
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
