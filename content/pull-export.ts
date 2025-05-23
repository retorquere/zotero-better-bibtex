/* eslint-disable @typescript-eslint/no-unsafe-return */
const OK = 200
const SERVER_ERROR = 500
const NOT_FOUND = 404
const CONFLICT = 409
const BAD_REQUEST = 400

import { Translators } from './translators'
import { get as getCollection } from './collection'
import { Library, get as getLibrary } from './library'
import { getItemsAsync } from './get-items-async'
import { fromPairs } from './object'
import { orchestrator } from './orchestrator'
import { Server } from './server'
import { log } from './logger'

const isTrue = new Set([ 'y', 'yes', 'true' ])
function displayOptions(request) {
  const query = Server.queryParams(request)

  return {
    // exportCharset: query.exportCharset || 'utf8',
    exportNotes: isTrue.has(query.exportNotes),
    useJournalAbbreviation: isTrue.has(query.useJournalAbbreviation),
    worker: !query.worker || isTrue.has(query.worker),
  }
}

class CollectionHandler {
  public supportedMethods = ['GET']

  public async init(request) {
    const urlpath: string = Server.queryParams(request)['']
    if (!urlpath) return [ NOT_FOUND, 'text/plain', 'Could not export bibliography: no path' ]

    try {
      const [ , lib, path, translator ] = urlpath.match(/^\/(?:([0-9]+)\/)?(.*)\.([-0-9a-z]+)$/i)

      const libID = parseInt(lib || '0') || Zotero.Libraries.userLibraryID

      let collection
      try {
        collection = Zotero.Collections.getByLibraryAndKey(libID, path)
      }
      catch (err) {
        log.error('pull-export: resolve by key error:', err)
      }
      if (!collection) {
        try {
          collection = await getCollection(`/${ libID }/${ path }`)
        }
        catch (err) {
          log.error('pull-export: resolve by path error:', err)
        }
      }

      if (!collection) return [ NOT_FOUND, 'text/plain', `Could not export bibliography: path '${ path }' not found` ]

      return [ OK, 'text/plain', await Translators.exportItems({
        translatorID: Translators.getTranslatorId(translator),
        displayOptions: displayOptions(request),
        scope: { type: 'collection', collection },
      }) ]
    }
    catch (err) {
      return [ { notfound: NOT_FOUND, duplicate: CONFLICT, error: SERVER_ERROR }[err.kind || 'error'], 'text/plain', `${ err }` ]
    }
  }
}

class LibraryHandler {
  public supportedMethods = ['GET']

  public async init(request) {
    const urlpath: string = Server.queryParams(request)['']
    if (!urlpath) return [ NOT_FOUND, 'text/plain', 'Could not export library: no path' ]

    log.debug('3243:', Zotero.Libraries.getAll().map(l => l.id))

    try {
      const [ , libID, translator ] = urlpath.match(/\/?(?:([0-9]+)\/)?library\.([-0-9a-z]+)$/i)
      const library = getLibrary(libID)

      if (!library) return [ NOT_FOUND, 'text/plain', `Could not export bibliography: library '${ urlpath }' does not exist` ]

      return [ OK, 'text/plain', await Translators.exportItems({
        translatorID: Translators.getTranslatorId(translator),
        displayOptions: displayOptions(request),
        scope: { type: 'library', id: library.libraryID },
      }) ]
    }
    catch (err) {
      return [ SERVER_ERROR, 'text/plain', `${ err }` ]
    }
  }
}

class SelectedHandler {
  public supportedMethods = ['GET']

  public async init(request) {
    const translator: string = Server.queryParams(request)['']

    if (!translator) return [ NOT_FOUND, 'text/plain', 'Could not export bibliography: no format' ]

    try {
      const items = Zotero.getActiveZoteroPane().getSelectedItems()
      if (!items.length) return [ NOT_FOUND, 'text/plain', 'Could not export bibliography: no selection' ]

      if (translator === 'quick-copy') {
        const format = Zotero.Prefs.get('export.quickCopy.setting')
        if (Zotero.QuickCopy.unserializeSetting(format).mode !== 'bibliography') throw new Error('formatted-citations requires the Zotero default quick-copy format to be set to a citation style')
        return [ OK, 'text/plain', Zotero.QuickCopy.getContentFromItems(items, format, null, true).text ]
      }

      return [ OK, 'text/plain', await Translators.exportItems({
        translatorID: Translators.getTranslatorId(translator),
        displayOptions: displayOptions(request),
        scope: { type: 'items', items },
      }) ]
    }
    catch (err) {
      return [ SERVER_ERROR, 'text/plain', `${ err }` ]
    }
  }
}

class ItemHandler {
  public supportedMethods = ['GET']

  public async init(request) {
    await Zotero.BetterBibTeX.ready

    try {
      const params = Server.queryParams(request)
      const candidates = [ 'libraryID', 'library', 'groupID', 'group' ].filter(key => typeof params[key] !== 'undefined')

      let lib: Library
      let param: string

      switch (candidates.length) {
        case 0:
          lib = getLibrary(Zotero.Libraries.userLibraryID)
          param = 'user library'
          break

        case 1:
          param = candidates[0]
          lib = getLibrary(params[param], param.startsWith('group'))
          break

        default:
          return [ BAD_REQUEST, 'text/plain', 'specify at most one of library(/ID) or group(/ID)' ]
      }

      if (!lib) return [ BAD_REQUEST, 'text/plain', `no ${param} ${JSON.stringify(params[param])}` ]

      const citationKeys: string[] = Array.from(new Set(params.citationKeys.split(',').filter(k => k)))
      if (!citationKeys.length) return [ SERVER_ERROR, 'text/plain', 'no citation keys provided' ]

      if (!params.translator) return [ SERVER_ERROR, 'text/plain', 'no translator selected' ]
      const translatorID = Translators.getTranslatorId(params.translator)
      if (!translatorID) return [ SERVER_ERROR, 'text/plain', `translator ${params.translator} not found` ]

      const response: {
        items: Record<string, any>
        zotero: Record<string, { itemID: number; uri: string }>
        errors: Record<string, string>
      } = { items: {}, zotero: {}, errors: {}}

      const itemIDs: Record<string, number> = {}
      for (const citationKey of citationKeys) {
        const key = Zotero.BetterBibTeX.KeyManager.find({ where: { libraryID: lib.libraryID, citationKey }})

        switch (key.length) {
          case 0:
            response.errors[citationKey] = 'not found'
            break
          case 1:
            itemIDs[citationKey] = key[0].itemID
            break
          default:
            response.errors[citationKey] = `${ key.length } items found with key "${ citationKey }"`
            break
        }
      }

      if (!Object.keys(itemIDs).length) return [ SERVER_ERROR, 'text/plain', 'no items found' ]

      // itemID => zotero item
      const items = fromPairs((await getItemsAsync(Object.values(itemIDs))).map(item => [ item.itemID, item ]))
      let contents = await Translators.exportItems({
        translatorID,
        displayOptions: displayOptions(request),
        scope: { type: 'items', items: Object.values(items) },
      })

      if (params.pandocFilterData) {
        let filtered_items
        switch (Translators.byId[translatorID]?.label) {
          case 'Better CSL JSON':
            filtered_items = JSON.parse(contents)
            break
          case 'BetterBibTeX JSON':
            filtered_items = JSON.parse(contents).items
            break
          default:
            throw new Error(`Unexpected translator ${ translatorID } from ${ params.translator }`)
        }

        for (const item of filtered_items) {
          // jzon gives citationKey, CSL gives id
          const citekey = item.citationKey || item.id
          response.items[citekey] = item
          response.zotero[citekey] = {
            itemID: itemIDs[citekey],
            uri: Zotero.URI.getItemURI(items[itemIDs[citekey]]),
          }
        }

        contents = JSON.stringify(response)
      }

      return [ OK, 'text/plain', contents ]
    }
    catch (err) {
      return [ SERVER_ERROR, 'text/plain', `${ err }` ]
    }
  }
}

orchestrator.add({
  id: 'pull-export',
  description: 'JSON-RPC endpoint',
  needs: ['translators'],

  startup: async () => { // eslint-disable-line @typescript-eslint/require-await
    Server.register([ '/better-bibtex/export/collection', '/better-bibtex/collection' ], CollectionHandler)
    Server.register([ '/better-bibtex/export/library', '/better-bibtex/library' ], LibraryHandler)
    Server.register([ '/better-bibtex/export/selected', '/better-bibtex/select' ], SelectedHandler)
    Server.register('/better-bibtex/export/item', ItemHandler)
    Server.startup()
  },

  shutdown: async () => { // eslint-disable-line @typescript-eslint/require-await
    Server.shutdown()
  },
})
