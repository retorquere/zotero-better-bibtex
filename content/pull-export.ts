declare const Zotero: any

const OK = 200
const SERVER_ERROR = 500

import Translators = require('./translators.ts')

function displayOptions(request) {
  const isTrue = new Set([ 'y', 'yes', 'true' ])
  const query = request.query || {}

  return {
    exportCharset: query.exportCharset || 'utf8',
    exportNotes: isTrue.has(query.exportNotes),
    useJournalAbbreviation: isTrue.has(query.useJournalAbbreviation),
  }
}

Zotero.Server.Endpoints['/better-bibtex/collection'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    if (!request.query || !request.query['']) return [SERVER_ERROR, 'text/plain', 'Could not export bibliography: no path']

    try {
      let [ , lib, path, translator ] = request.query[''].match(/\/([0-9]+)\/(.*)\.([a-zA-Z]+)$/)

      translator = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === translator) || translator
      const libID = parseInt(lib)

      let collection = Zotero.Collections.getByLibraryAndKey(libID, path)
      if (!collection) {
        for (const name of path.toLOwerCase().split('/')) {
          if (!name) continue

          const children = Zotero.getCollections(collection ? collection.id : null, false, libID)
          for (const child of children) {
            if (child.name.toLowerCase() === name) {
              collection = child
              break
            }
          }
          if (!collection) return [SERVER_ERROR, 'text/plain', `Could not export bibliography: path '${path}' not found`]
        }
      }

      return [ OK, 'text/plain', await Translators.translate(translator, displayOptions(request), { collection }) ]

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.Server.Endpoints['/better-bibtex/library'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    const library = request.query ? request.query[''] : null
    if (!library) return [SERVER_ERROR, 'text/plain', 'Could not export library: no path']

    try {
      let [ , libID, translator ] = /^\/?([0-9]+)?\/?library.(.+)$/.exec(library)

      if (libID && !Zotero.Libraries.exists(libID)) {
        return [SERVER_ERROR, 'text/plain', `Could not export bibliography: library '${library}' does not exist`]
      }

      if (!translator) {
        return [SERVER_ERROR, 'text/plain', `Could not export bibliography '${library}': no format specified` ]
      }

      translator = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === translator) || translator

      return [OK, 'text/plain', await Translators.translate(translator, displayOptions(request), { library: parseInt(libID) }) ]

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.Server.Endpoints['/better-bibtex/select'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    let translator = request.query ? request.query[''] : null

    if (!translator) return [SERVER_ERROR, 'text/plain', 'Could not export bibliography: no format' ]

    try {
      const items = Zotero.getActiveZoteroPane().getSelectedItems()
      if (!items.length) return [SERVER_ERROR, 'text/plain', 'Could not export bibliography: no selection' ]

      translator = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === translator) || translator

      return [OK, 'text/plain', await Translators.translate(translator, displayOptions(request), { items }) ]
    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}
