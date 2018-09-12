declare const Zotero: any

import { Preferences as Prefs } from './prefs'
import * as log from './debug'
import { DB as Cache } from './db/cache'

const prefOverrides = require('../gen/preferences/auto-export-overrides.json')

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Translators = new class { // tslint:disable-line:variable-name
  public byId: any
  public byName: any
  public byLabel: any

  constructor() {
    Object.assign(this, require('../gen/translators.json'))
  }

  public async init() {
    const start = (new Date()).valueOf()

    let reinit = false

    if (Prefs.get('removeStock')) {
      this.uninstall('BibLaTeX', 'b6e39b57-8942-4d11-8259-342c46ce395f')
      this.uninstall('BibTeX', '9cb70025-a888-4a29-a210-93ec52da40d4')
      reinit = true
    }

    // cleanup old translators
    if (this.uninstall('Better BibTeX Quick Copy', '9b85ff96-ceb3-4ca2-87a9-154c18ab38b1')) reinit = true

    for (const header of Object.values(this.byId)) {
      if (await this.install(header)) reinit = true
    }

    if (reinit) {
      log.debug('Translators.init: reinit translators...')
      try {
        log.debug('Translators.init: reinit start @', (new Date()).valueOf() - start)
        await Zotero.Translators.reinit()
        log.debug('Translators.init: reinit ready @', (new Date()).valueOf() - start)
      } catch (err) {
        log.error('Translator.inits: reinit failed @', (new Date()).valueOf() - start, err)
      }
    }
  }

  public async translate(translatorID: string, displayOptions: any, items: { library?: any, items?: any, collection?: any }, path = null) {
    await Zotero.BetterBibTeX.ready

    const start = Date.now()
    log.debug('Translators.translate', { translatorID, displayOptions, path })

    const deferred = Zotero.Promise.defer()
    const translation = new Zotero.Translate.Export()

    log.debug('Translators.translate prepping', { translatorID, displayOptions, path })

    if (!items) items = { library: Zotero.Libraries.userLibraryID }

    if (items.library) {
      translation.setLibraryID(items.library)

    } else if (items.items) {
      translation.setItems(items.items)

    } else if (items.collection) {
      if (typeof items.collection === 'number') items.collection = Zotero.Collections.get(items.collection)
      translation.setCollection(items.collection)

    }

    await this.primeCache(translatorID, displayOptions, items)

    translation.setTranslator(translatorID)
    if (displayOptions && (Object.keys(displayOptions).length !== 0)) translation.setDisplayOptions(displayOptions)

    if (path) {
      const file = Zotero.File.pathToFile(path)

      if (file.exists() && !file.isFile()) {
        deferred.reject(Zotero.BetterBibTeX.getString('Translate.error.target.notaFile', { path }))
        return deferred.promise
      }

      if (!file.parent || !file.parent.exists()) {
        deferred.reject(Zotero.BetterBibTeX.getString('Translate.error.target.noParent', { path }))
        return deferred.promise
      }

      translation.setLocation(file)
    }

    log.debug('Translators.translate starting', { translatorID, displayOptions, path })

    translation.setHandler('done', (obj, success) => {
      if (success) {
        log.debug('Translators.translate complete in', { time: Date.now() - start, translatorID, displayOptions, path })
        deferred.resolve(obj ? obj.string : undefined)
      } else {
        log.error('Translators.translate failed in', { time: Date.now() - start, translatorID, displayOptions, path })
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

    log.debug('Translators.install: installed =', installed)

    if (installed && installed.lastUpdated === header.lastUpdated) {
      log.debug('Translators.install:', header.label, 'not reinstalling', header.lastUpdated)
      return false
    } else if (installed) {
      log.debug('Translators.install:', header.label, 'replacing', installed.lastUpdated, 'with', header.lastUpdated)
    } else {
      log.debug('Translators.install:', header.label, 'not installed, installing', header.lastUpdated)
    }

    log.debug('Translators.install: saving translator', header.label)

    try {
      const translator = Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.js`)
      const [ , metadata, code ] = translator.match(/^([\s\S]+?}\n\n)([\s\S]+)/)

      header = JSON.parse(metadata)
      delete header.description
      await Zotero.Translators.save(header, code)

      log.debug('Translator.install', header, 'succeeded')
    } catch (err) {
      log.error('Translator.install', header, 'failed:', err)
      this.uninstall(header.label, header.translatorID)
    }

    return true
  }

  public async primeCache(translatorID, displayOptions, scope) {
    let sql: string
    let items: any[]
    let itemIDs: number[]

    const threshold: number = Prefs.get('primeExportCache')
    const cache = this.byId[translatorID] && Cache.getCollection(this.byId[translatorID].label)

    log.debug('priming cache:', { threshold, cache: !!cache, displayOptions })
    if (!threshold || !cache || displayOptions.exportFileData) return

    if (scope.library) {
      sql = `SELECT itemID FROM items WHERE libraryID = ${scope.library} AND itemID NOT IN (SELECT itemID FROM deletedItems)`

    } else if (scope.items) {
      items = scope.items
      itemIDs = scope.items.map(item => item.id)

    } else if (scope.collection) {
      sql = `SELECT itemID FROM collectionItems WHERE collectionID = ${scope.collection.id}`
    }

    if (sql) itemIDs = (await Zotero.DB.queryAsync(sql)).map(item => item.itemID)

    const query = {
      exportNotes: !!displayOptions.exportNotes,
      useJournalAbbreviation: !!displayOptions.useJournalAbbreviation,
    }
    for (const pref of prefOverrides) {
      query[pref] = typeof displayOptions[pref] !== 'undefined' ? displayOptions[pref] : Prefs.get(pref)
    }

    const cached = new Set(cache.find(query).map(item => item.itemID))
    const uncached = itemIDs.filter(id => !cached.has(id))

    if (uncached.length < threshold) return

    log.debug('priming cache:', uncached.length, 'uncached items')

    if (!items) items = await Zotero.Items.getAsync(uncached)
    await Promise.all(items.map(item => this.translate(translatorID, displayOptions, { items: [ item ] })))

    log.debug('priming cache: done ')
  }
}
