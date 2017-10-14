declare const Zotero: any

const prefs = require('./prefs.ts')
const debug = require('./debug.ts')

class Translators {
  public byId: any

  public async init() {
    const start = (new Date()).valueOf()
    Object.assign(this, require('../gen/translators.json'))

    if (prefs.get('removeStock')) {
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

  public async translate(translatorID, displayOptions, items, path) {
    if (!items) items = { library: Zotero.Libraries.userLibraryID }

    const translationPromise = new Promise((resolve, reject) => {
      const translation = new Zotero.Translate.Export()

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

    return await translationPromise
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
    let code
    if (!header.label || !header.translatorID) throw new Error('not a translator')

    try {
      code = Zotero.File.getContentsFromURL(`resource://zotero-better-bibtex/${header.label}.js`)
    } catch (err) {
      debug('Translators.install: ', header, 'could not be loaded:', err)
      throw err
    }

    debug('Translators.install header:', header)
    try {
      let existing
      const fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
      const destFile = Zotero.getTranslatorsDirectory()
      destFile.append(fileName)

      if (existing = Zotero.Translators.get(header.translatorID)) {
        const end_of_json = '\n}'
        let newHeader = code.substring(0, code.indexOf(end_of_json) + end_of_json.length)
        debug('Translators.install: existing:', existing, 'new', newHeader)
        try {
          newHeader = JSON.parse(newHeader)
          if (newHeader.lastUpdated === existing.lastUpdated) return false
        } catch (err) {
          debug('Translators.install: failed to parse new header:', err, newHeader)
        }

      } else {
        debug('Translators.install: no existing:', header.translatorID)
      }

      debug('Translators.install: saving translator', header.label)

      Zotero.File.putContents(destFile, code)

      debug('Translator.install', header, 'succeeded')

    } catch (err) {
      debug('Translator.load', header, 'failed:', err)
      this.uninstall(header.label, header.translatorID)
    }

    return true
  }
}

export = new Translators()
