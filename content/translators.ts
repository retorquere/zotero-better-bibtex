declare const Zotero: any

import Prefs = require('./prefs.ts')
import debug = require('./debug.ts')

class Translators {
  public byId: any
  public byName: any
  public byLabel: any

  public async init() {
    const start = (new Date()).valueOf()
    Object.assign(this, require('../gen/translators.json'))

    let reinit = false

    if (Prefs.get('removeStock')) {
      this.uninstall('BibLaTeX', 'b6e39b57-8942-4d11-8259-342c46ce395f')
      this.uninstall('BibTeX', '9cb70025-a888-4a29-a210-93ec52da40d4')
      reinit = true
    }

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

  public translate(translatorID: string, displayOptions: any, items: { library?: any, items?: any, collection?: any }, path = null): Promise<string> {
    return new Promise((resolve, reject) => {
      const translation = new Zotero.Translate.Export()

      if (!items) items = { library: Zotero.Libraries.userLibraryID }

      if (items.library) translation.setLibraryID(items.library)
      if (items.items) translation.setItems(items.items)
      if (items.collection) translation.setCollection(typeof items.collection === 'number' ? Zotero.Collections.get(items.collection) : items.collection)

      translation.setTranslator(translatorID)
      if (displayOptions && (Object.keys(displayOptions).length !== 0)) translation.setDisplayOptions(displayOptions)
      if (path) translation.setLocation(Zotero.File.pathToFile(path))
      translation.setHandler('done', (obj, success) => {
        if (success) {
          return resolve(obj ? obj.string : undefined)
        } else {
          return reject('translation failed')
        }
      })
      translation.translate()
    })
  }

  public uninstall(label, id) {
    try {
      const fileName = Zotero.Translators.getFileNameFromLabel(label, id)
      const destFile = Zotero.getTranslatorsDirectory()
      destFile.append(fileName)
      if (destFile.exists()) destFile.remove(false)
    } catch (err) {
      debug(`Translators.uninstall: failed to remove ${label}:`, err)
    }
  }

  public async install(header) {
    if (!header.label || !header.translatorID) throw new Error('not a translator')

    const fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
    const destFile = Zotero.getTranslatorsDirectory()
    destFile.append(fileName)

    let manualParse = null
    if (destFile.exists()) {
      const code = Zotero.File.getContents(destFile)
      const end_of_json = '\n}'
      manualParse = JSON.parse(code.substring(0, code.indexOf(end_of_json) + end_of_json.length))
    }

    let installed = null
    try {
      installed = Zotero.Translators.get(header.translatorID)
    } catch (err) {
      debug('Translators.install', header, err)
      installed = null
    }

    debug('Translators.install: installed =', installed, manualParse)

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
      Zotero.File.putContents(destFile, Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.js`))

      debug('Translator.install', header, 'succeeded')
    } catch (err) {
      debug('Translator.install', header, 'failed:', err)
      this.uninstall(header.label, header.translatorID)
    }

    await Zotero.Translators.cacheInDB(header.label + '.js', JSON.stringify(header), Date.parse(header.lastModifiedTime))

    return true
  }
}

export = new Translators()
