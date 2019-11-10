declare const Zotero: any
declare const Services: any

import { Preferences as Prefs } from './prefs'
import * as log from './debug'
import { DB as Cache } from './db/cache'
import { DB } from './db/main'
import { timeout } from './timeout'

import * as fold from './fold.json'
import * as prefOverrides from '../gen/preferences/auto-export-overrides.json'
import * as translatorMetadata from '../gen/translators.json'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Translators = new class { // tslint:disable-line:variable-name
  public byId: any
  public byName: any
  public byLabel: any
  public itemType: { note: number, attachment: number }

  constructor() {
    Object.assign(this, translatorMetadata)
  }

  public async init() {
    const start = (new Date()).valueOf()

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

  public async primeCache(translatorID: string, displayOptions: any, scope: any) {
    scope = this.items(scope)

    let reason: string = null
    let uncached: any[] = []

    const threshold: number = Prefs.get('autoExportPrimeExportCacheThreshold') || 0

    if (!reason && !threshold) reason = 'priming threshold set to 0'
    if (!reason && Prefs.get('jabrefFormat') === 4) reason = 'JabRef Format 4 cannot be cached' // tslint:disable-line:no-magic-numbers
    if (!reason && displayOptions.exportFileData) reason = 'Cache disabled when exporting attachments'
    if (!reason && Prefs.get('relativeFilePaths')) reason = 'Cache disabled when relativeFilePaths is on'
    if (!reason) {
      uncached = await this.uncached(translatorID, displayOptions, scope)
      if (!uncached.length) {
        reason = 'No uncached items found'
      } else if (uncached.length < threshold) {
        reason = `${uncached.length} uncached items found, but not priming for less than ${threshold}`
      }
    }
    if (reason) {
      log.debug(':cache:prime: not priming cache:', reason)
      return
    }

    switch (typeof uncached[0]) {
      case 'number':
      case 'string':
        uncached = await Zotero.Items.getAsync(uncached)
    }

    const batch = Math.max(Prefs.get('autoExportPrimeExportCacheBatch') || 0, 1)
    const delay = Math.max(Prefs.get('autoExportPrimeExportCacheDelay') || 0, 1)
    log.debug(fold.start, ':cache:prime:', uncached.length)

    const debugEnabled = Zotero.Debug.enabled
    while (uncached.length) {
      log.debug(':cache:prime:remaining', uncached.length)

      Zotero.Debug.enabled = false

      const _batch = uncached.splice(0, batch)

      await this.exportItems(translatorID, displayOptions, { items: _batch })

      Zotero.Debug.enabled = debugEnabled

      // give the UI a chance
      await timeout(delay)
    }
    log.debug(':cache:prime:done', fold.end)
  }

  public async exportItems(translatorID: string, displayOptions: any, items: { library?: any, items?: any, collection?: any }, path = null) {
    await Zotero.BetterBibTeX.ready

    const start = Date.now()

    const deferred = Zotero.Promise.defer()
    const translation = new Zotero.Translate.Export()

    items = this.items(items)

    if (items.library) {
      translation.setLibraryID(items.library)

    } else if (items.items) {
      translation.setItems(items.items)

    } else if (items.collection) {
      translation.setCollection(items.collection)

    } else {
      log.debug(':cache:exportItems: nothing?')

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

    const translator = Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.js`)
    const [ , metadata, code ] = translator.match(/^([\s\S]+?}\n\n)([\s\S]+)/)
    header = JSON.parse(metadata)
    delete header.description // why did I have this?

    if (installed && installed.configOptions && installed.configOptions.hash === header.configOptions.hash) {
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

  private items(items) {
    if (!items) {
      return { library: Zotero.Libraries.userLibraryID }
    }

    if (typeof items.collection === 'number') {
      return { collection: Zotero.Collections.get(items.collection) }
    }

    return items
  }
}
