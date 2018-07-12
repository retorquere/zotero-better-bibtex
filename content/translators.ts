declare const Zotero: any

import { Preferences as Prefs } from './prefs'
import { debug } from './debug'

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
      debug('Translators.init: reinit translators...')
      try {
        debug('Translators.init: reinit start @', (new Date()).valueOf() - start)
        await Zotero.Translators.reinit()
        debug('Translators.init: reinit ready @', (new Date()).valueOf() - start)
      } catch (err) {
        debug('Translator.inits: reinit failed @', (new Date()).valueOf() - start, err)
      }
    }
  }

  public async translate(translatorID: string, displayOptions: any, items: { library?: any, items?: any, collection?: any }, path = null) {
    debug('Translators.translate', { translatorID, displayOptions, path })

    await Zotero.BetterBibTeX.ready

    const deferred = Zotero.Promise.defer()
    const translation = new Zotero.Translate.Export()

    debug('Translators.translate prepping', { translatorID, displayOptions, path })

    if (!items) items = { library: Zotero.Libraries.userLibraryID }

    if (items.library) translation.setLibraryID(items.library)
    if (items.items) translation.setItems(items.items)
    if (items.collection) translation.setCollection(typeof items.collection === 'number' ? Zotero.Collections.get(items.collection) : items.collection)

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

    translation.setHandler('done', (obj, success) => {
      if (success) {
        debug('Translators.translate complete', { translatorID, displayOptions, path })
        deferred.resolve(obj ? obj.string : undefined)
      } else {
        debug('Translators.translate failed', { translatorID, displayOptions, path })
        deferred.reject('translation failed')
      }
    })

    debug('Translators.translate starting', { translatorID, displayOptions, path })
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
      debug(`Translators.uninstall: failed to remove ${label}:`, err)
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
      debug('Translators.install', header, err)
      installed = null
    }

    debug('Translators.install: installed =', installed)

    if (installed && installed.lastUpdated === header.lastUpdated) {
      debug('Translators.install:', header.label, 'not reinstalling', header.lastUpdated)
      return false
    } else if (installed) {
      debug('Translators.install:', header.label, 'replacing', installed.lastUpdated, 'with', header.lastUpdated)
    } else {
      debug('Translators.install:', header.label, 'not installed, installing', header.lastUpdated)
    }

    debug('Translators.install: saving translator', header.label)

    try {
      const translator = Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.js`)
      const [ , metadata, code ] = translator.match(/^([\s\S]+?}\n\n)([\s\S]+)/)

      header = JSON.parse(metadata)
      delete header.description
      await Zotero.Translators.save(header, code)

      debug('Translator.install', header, 'succeeded')
    } catch (err) {
      debug('Translator.install', header, 'failed:', err)
      this.uninstall(header.label, header.translatorID)
    }

    return true
  }
}
