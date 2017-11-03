const OK = 200
const SERVER_ERROR = 500

import Translators = require('./translators.ts')

function displayOptions(request) {
  const isTrue = new Set([ 'y', 'yes', 'true' ])
  const { exportCharset, exportNotes, useJournalAbbreviation } = request.query || {}

  return {
    exportCharset,
    exportNotes: isTrue.has(exportNotes),
    useJournalAbbreviation: isTrue.has(useJournalAbbreviation),
  }
}

Zotero.Server.Endpoints['/better-bibtex/collection'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    let path = request.query ? request.query[''] : null
    if (!path) return [SERVER_ERROR, 'text/plain', 'Could not export bibliography: no path']

    try {
      let [ , path, translator ] = path.match(/(.*)\.([a-zA-Z]+)$/)

      translator = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === translator) || translator
      if (path[0] !== '/') path = `/0/${path}`

      let [ , lib, path ] = path.match(/\/([0-9]+)\/(.*)/)
      libID = parseInt(lib)

      let collection = Zotero.Collections.getByLibraryAndKey(libID, path)
      if (!collection) {
        for (const subcol of path.toLOwerCase().split('/')) {
          if (!subcol) continue

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

      return [OK, 'text/plain', yield Translators.translate(translator, { collection }, displayOptions(request)) ]

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.Server.Endpoints['/better-bibtex/library'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    let library = request.query ? request.query[''] : null
    if (!library) return [SERVER_ERROR, 'text/plain', 'Could not export library: no path']

    try {
      let [ , libID, translator ] = /^\/?([0-9]+)?\/?library.(.+)$/.exec(library)
  
      if (libID && !Zotero.Libraries.exists(libID)) {
        return [SERVER_ERROR, 'text/plain', `Could not export bibliography: library '${library}' does not exist`]
      }

      if (!format) {
        return [SERVER_ERROR, 'text/plain', `Could not export bibliography '${library}': no format specified` ]
      }

      translator = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === translator) || translator
  
      return [OK, 'text/plain', yield Translators.translate(translator, { library: parseInt(libID) }, displayOptions(request)) ]

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.Server.Endpoints['/better-bibtex/select'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    let translator = request.query ? request.query[''] : null
  
    if (!translator) {
      return [SERVER_ERROR, 'text/plain', `Could not export bibliography: no format` ]
    }

    try {
      zoteroPane = Zotero.getActiveZoteroPane()
      items = getItemsAsync(zoteroPane.getSelectedItems().map(item -> item.id))
  
      translator = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === translator) || translator

      return [OK, 'text/plain', yield Translators.translate(translator, { items }, displayOptions(request)) ]
    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}
