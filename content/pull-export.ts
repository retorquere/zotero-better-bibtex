declare const Zotero: any

const OK = 200
const SERVER_ERROR = 500
const NOT_FOUND = 404

import { Translators } from './translators'
import { get as getCollection } from './collection'
import { get as getLibrary } from './library'
import { getItemsAsync } from './get-items-async'
import { KeyManager } from './key-manager'

function displayOptions(request) {
  const isTrue = new Set([ 'y', 'yes', 'true' ])
  const query = request.query || {}

  return {
    exportCharset: query.exportCharset || 'utf8',
    exportNotes: isTrue.has(query.exportNotes),
    useJournalAbbreviation: isTrue.has(query.useJournalAbbreviation),
    pandocFilterData: isTrue.has(query.pandocFilterData),
  }
}

Zotero.Server.Endpoints['/better-bibtex/export/collection'] = Zotero.Server.Endpoints['/better-bibtex/collection'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    if (!request.query || !request.query['']) return [NOT_FOUND, 'text/plain', 'Could not export bibliography: no path']

    try {
      const [ , lib, path, translator ] = request.query[''].match(/^\/(?:([0-9]+)\/)?(.*)\.([-0-9a-z]+)$/i)

      const libID = parseInt(lib || 0) || Zotero.Libraries.userLibraryID

      const collection = Zotero.Collections.getByLibraryAndKey(libID, path) || (await getCollection(`/${libID}/${path}`))
      if (!collection) return [NOT_FOUND, 'text/plain', `Could not export bibliography: path '${path}' not found`]

      return [ OK, 'text/plain', await Translators.exportItems(Translators.getTranslatorId(translator), displayOptions(request), { type: 'collection', collection }) ]

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.Server.Endpoints['/better-bibtex/export/library'] = Zotero.Server.Endpoints['/better-bibtex/library'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    if (!request.query || !request.query['']) return [NOT_FOUND, 'text/plain', 'Could not export library: no path']

    try {
      const [ , lib, translator ] = request.query[''].match(/\/?(?:([0-9]+)\/)?library\.([-0-9a-z]+)$/i)
      const libID = parseInt(lib || 0) || Zotero.Libraries.userLibraryID

      if (!Zotero.Libraries.exists(libID)) {
        return [NOT_FOUND, 'text/plain', `Could not export bibliography: library '${request.query['']}' does not exist`]
      }

      return [OK, 'text/plain', await Translators.exportItems(Translators.getTranslatorId(translator), displayOptions(request), { type: 'library', id: libID }) ]

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.Server.Endpoints['/better-bibtex/export/selected'] = Zotero.Server.Endpoints['/better-bibtex/select'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    const translator = request.query ? request.query[''] : null

    if (!translator) return [NOT_FOUND, 'text/plain', 'Could not export bibliography: no format' ]

    try {
      const items = Zotero.getActiveZoteroPane().getSelectedItems()
      if (!items.length) return [NOT_FOUND, 'text/plain', 'Could not export bibliography: no selection' ]

      return [OK, 'text/plain', await Translators.exportItems(Translators.getTranslatorId(translator), displayOptions(request), { type: 'items', items }) ]
    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.Server.Endpoints['/better-bibtex/export/item'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    await Zotero.BetterBibTeX.ready

    try {
      let { translator, citationKey, libraryID, library } = request.query
      if (typeof libraryID !== 'undefined' && library) throw new Error('specify one of library or libraryID')
      if (typeof library === 'undefined' && library) libraryID = getLibrary(library)
      if (typeof library === 'undefined') libraryID = Zotero.Libraries.userLibraryID

      if (!translator) throw new Error('no translator selected')
      if (!citationKey) throw new Error('no citation key provided')

      const key = KeyManager.keys.find({ libraryID, citekey: citationKey })
      let itemID
      switch (key.length) {
        case 0:
          throw new Error(`item with key "${citationKey}" not found`)
        case 1:
          itemID = key[0].itemID
          break
        default:
          throw new Error(`${key.length} items found with key "${citationKey}"`)
      }

      return [OK, 'text/plain', await Translators.exportItems(Translators.getTranslatorId(translator), displayOptions(request), { type: 'items', items: [ await getItemsAsync([itemID]) ] }) ]
    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}
