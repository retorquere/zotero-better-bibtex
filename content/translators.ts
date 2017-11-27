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

    if (Prefs.get('removeStock')) {
      this.uninstall('BibLaTeX', 'b6e39b57-8942-4d11-8259-342c46ce395f')
      this.uninstall('BibTeX', '9cb70025-a888-4a29-a210-93ec52da40d4')
    }

    let reinit = false
    // tslint:disable-next-line:no-unused-variable
    for (const [id, header] of Object.entries(this.byId)) {
      if (this.install(header)) {
        reinit = true
        debug('Translators.init: installed', header.label, '@', (new Date()).valueOf() - start)
      } else {
        debug('Translators.init: retained', header.label, '@', (new Date()).valueOf() - start)
      }
    }

    if (!reinit) return

    debug('Translators.init: reinit translators...')
    try {
      await Zotero.Translators.reinit()
      debug('Translators.init: reinit ready @', (new Date()).valueOf() - start)
    } catch (err) {
      debug('Translator.inits: reinit failed @', (new Date()).valueOf() - start, err)
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

  public install(header) {
    if (!header.label || !header.translatorID) throw new Error('not a translator')

    try {
      const installed = Zotero.Translators.get(header.translatorID)
      if (((installed || {}).configOptions || {}).BetterBibTeX === header.configOptions.BetterBibTeX) return false
    } catch (err) {
      debug('Translators.install', header, err)
    }

    debug('Translators.install: saving translator', header.label)

    try {
      const fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
      const destFile = Zotero.getTranslatorsDirectory()
      destFile.append(fileName)

      Zotero.File.putContents(destFile, Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.js`))

      debug('Translator.install', header, 'succeeded')
    } catch (err) {
      debug('Translator.install', header, 'failed:', err)
      this.uninstall(header.label, header.translatorID)
    }

    return true
  }
}

export = new Translators()
