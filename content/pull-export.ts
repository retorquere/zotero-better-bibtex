declare const Zotero: any

const OK = 200
const SERVER_ERROR = 500
const NOT_FOUND = 404

import { Translators } from './translators'

function displayOptions(request) {
  const isTrue = new Set([ 'y', 'yes', 'true' ])
  const query = request.query || {}

  return {
    exportCharset: query.exportCharset || 'utf8',
    exportNotes: isTrue.has(query.exportNotes),
    useJournalAbbreviation: isTrue.has(query.useJournalAbbreviation),
  }
}

function getTranslatorId(name) {
  const _name = name.toLowerCase()

  if (_name === 'jzon') return Translators.byLabel.BetterBibTeXJSON.translatorID
  if (_name === 'bib') return Translators.byLabel.BetterBibLaTeX.translatorID

  for (const [id, translator] of (Object.entries(Translators.byId) as Array<[string, ITranslatorHeader]>)) {
    if (! ['yaml', 'json', 'bib'].includes(translator.target) ) continue
    if (! translator.label.startsWith('Better ') ) continue

    if (translator.label.replace('Better ', '').replace(' ', '').toLowerCase() === _name) return id
    if (translator.label.split(' ').pop().toLowerCase() === _name) return id
  }

  // allowed to pass GUID
  return name
}

Zotero.Server.Endpoints['/better-bibtex/collection'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    if (!request.query || !request.query['']) return [NOT_FOUND, 'text/plain', 'Could not export bibliography: no path']

    try {
      const [ , lib, path, translator ] = request.query[''].match(/^\/(?:([0-9]+)\/)?(.*)\.([-0-9a-z]+)$/i)

      const libID = parseInt(lib || 0) || Zotero.Libraries.userLibraryID

      let collection = Zotero.Collections.getByLibraryAndKey(libID, path)
      if (!collection) {
        for (const name of path.toLowerCase().split('/')) {
          if (!name) continue

          const collections = collection ? Zotero.Collections.getByParent(collection.id) : Zotero.Collections.getByLibrary(libID)
          for (const candidate of collections) {
            if (candidate.name.toLowerCase() === name) {
              collection = candidate
              break
            }
          }
          if (!collection) return [NOT_FOUND, 'text/plain', `Could not export bibliography: path '${path}' not found`]
        }
      }

      return [ OK, 'text/plain', await Translators.exportItems(getTranslatorId(translator), displayOptions(request), { collection }) ]

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.Server.Endpoints['/better-bibtex/library'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    if (!request.query || !request.query['']) return [NOT_FOUND, 'text/plain', 'Could not export library: no path']

    try {
      const [ , lib, translator ] = request.query[''].match(/\/?(?:([0-9]+)\/)?library\.([-0-9a-z]+)$/i)
      const libID = parseInt(lib || 0) || Zotero.Libraries.userLibraryID

      if (!Zotero.Libraries.exists(libID)) {
        return [NOT_FOUND, 'text/plain', `Could not export bibliography: library '${request.query['']}' does not exist`]
      }

      return [OK, 'text/plain', await Translators.exportItems(getTranslatorId(translator), displayOptions(request), { library: libID }) ]

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.Server.Endpoints['/better-bibtex/select'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    const translator = request.query ? request.query[''] : null

    if (!translator) return [NOT_FOUND, 'text/plain', 'Could not export bibliography: no format' ]

    try {
      const items = Zotero.getActiveZoteroPane().getSelectedItems()
      if (!items.length) return [NOT_FOUND, 'text/plain', 'Could not export bibliography: no selection' ]

      return [OK, 'text/plain', await Translators.exportItems(getTranslatorId(translator), displayOptions(request), { items }) ]
    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}
