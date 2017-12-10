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

  public translate(translatorID: string, displayOptions: any, items: { library?: any, items?: any, collection?: any }, path = null): Promise<string> {
    return new Promise((resolve, reject) => {
      const translation = new Zotero.Translate.Export()

      if (!items) items = { library: Zotero.Libraries.userLibraryID }

      if (items.library) translation.setLibraryID(items.library)
      if (items.items) translation.setItems(items.items)
      if (items.collection) translation.setCollection(typeof items.collection === 'number' ? Zotero.Collections.get(items.collection) : items.collection)

      translation.setTranslator(translatorID)
      if (displayOptions && (Object.keys(displayOptions).length !== 0)) translation.setDisplayOptions(displayOptions)

      if (path) {
        const file = Zotero.File.pathToFile(path)

        if (file.exists() && !file.isFile()) return reject(`${path} exists but is not a file`)
        if (!file.parent || !file.parent.exists()) return reject(`${path} does not have a parent folder`)

        translation.setLocation(file)
      }

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

      await Zotero.Translators.save(JSON.parse(metadata), code)

      debug('Translator.install', header, 'succeeded')
    } catch (err) {
      debug('Translator.install', header, 'failed:', err)
      this.uninstall(header.label, header.translatorID)
    }

    return true
  }
}

export = new Translators()
