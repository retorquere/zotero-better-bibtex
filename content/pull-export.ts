/* eslint-disable @typescript-eslint/no-unsafe-return */
const OK = 200
const SERVER_ERROR = 500
const NOT_FOUND = 404
// const CONFLICT = 409
const BAD_REQUEST = 400

import { Translators } from './translators'
import * as Collection from './collection'
import * as Library from './library'
import { getItemsAsync } from './get-items-async'
import { fromPairs } from './object'
import { orchestrator } from './orchestrator'
import { Server } from './server'
import { log } from './logger'
import { Preferences } from '../gen/preferences/meta'

function displayOptions(request) {
  const query = Server.queryParams(request)
  if (!query.worker) query.worker = 'y'

  const options = structuredClone(request.data || {})
  if (request.data?.config?.preferences) options.cache = false
  for (const option of ['exportNotes', 'useJournalAbbreviation', 'worker']) {
    if (query[option]) options[option] = !!query[option].match(/^(y(es)?|true)$/)
  }

  return options
}

function exportPreferences(request): Partial<Preferences> {
  log.debug('3258: preferences =', request.data?.config?.preferences || {})
  return request.data?.config?.preferences || {}
}

class Handler {
  public supportedMethods = ['GET', 'POST']
  public supportedDataTypes = ['application/json']

  public async init(request) {
    let urlpath: string = Server.queryParams(request)['']
    if (urlpath[0] === '/') urlpath = urlpath.substring(1)
    if (!urlpath) return [ NOT_FOUND, 'text/plain', 'Could not export bibliography: no path' ]

    let m = urlpath.match(/[.]([^.]+)$/)
    if (!m) return [ NOT_FOUND, 'text/plain', 'Could not export bibliography: no type' ]
    const ext = m[1]
    const translatorID = Translators.getTranslatorId(ext)
    urlpath = urlpath.slice(0, -1 * m[0].length)

    let library = Zotero.Libraries.get(Zotero.Libraries.userLibraryID)
    if (m = urlpath.match(/^(group|library);(id|name):([^/]+)[/]/)) {
      urlpath = urlpath.substring(m[0].length)

      if (m[2] === 'id' && !m[3].match(/^\d+$/)) return [ NOT_FOUND, 'text/plain', `${m[1]} ID is not a number` ]

      switch (`${m[1]}.${m[2]}`) {
        case 'library.id':
          library = Library.get({ libraryID: parseInt(m[3]) })
          break
        case 'library.name':
          library = Library.get({ library: m[3] })
          break
        case 'group.id':
          library = Library.get({ groupID: parseInt(m[3]) })
          break
        case 'group.name':
          library = Library.get({ group: m[3] })
          break
      }
    }
    if (!library) return [ NOT_FOUND, 'text/plain', `Could not export bibliography: library ${m?.[3]} does not exist` ]

    if (m = urlpath.match(/^collection(?:;(id|key):(.+?)[/])?/)) {
      urlpath = urlpath.substring(m[0].length)
      let collection: Zotero.Collection
      switch (m[1]) {
        case 'id':
          if (!m[2].match(/^\d+$/)) return [ NOT_FOUND, 'text/plain', `${m[2]} ID is not a number` ]
          collection = Zotero.Collections.get(parseInt(m[2]))
          break
        case 'key':
          collection = Zotero.Collections.getByLibraryAndKey(library.libraryID, m[2]) || undefined
          break
        default:
          try {
            collection = await Collection.resolve(library, urlpath)
          }
          catch (err) {
            if (err.code) return [ err.code, 'text/plain', err.message ]
            throw err
          }
          break
      }
      if (!collection) return [ NOT_FOUND, 'text/plain', `Could not export bibliography: path '${ urlpath }' not found` ]

      return [
        OK,
        {
          'Content-Disposition': `attachment; filename=${JSON.stringify(collection.name + '.' + ext)}`,
          'Content-Type': 'text/plain',
        },
        await Translators.exportItems({
          translatorID,
          displayOptions: displayOptions(request),
          preferences: exportPreferences(request),
          scope: { type: 'collection', collection },
        }),
      ]
    }

    return [
      OK,
      {
        'Content-Disposition': `attachment; filename=${JSON.stringify(library.name + '.' + ext)}`,
        'Content-Type': 'text/plain',
      },
      await Translators.exportItems({
        translatorID,
        displayOptions: displayOptions(request),
        preferences: exportPreferences(request),
        scope: { type: 'library', id: library.libraryID },
      }),
    ]
  }
}

class CollectionHandler {
  public supportedMethods = ['GET', 'POST']
  public supportedDataTypes = ['application/json']

  public async init(request) {
    const urlpath: string = Server.queryParams(request)['']
    if (!urlpath) return [ NOT_FOUND, 'text/plain', 'Could not export bibliography: no path' ]

    const [ , lib, path, translator ] = urlpath.match(/^\/(?:([0-9]+)\/)?(.*)\.([-0-9a-z]+)$/i)

    const libraryID = Library.get({ libraryID: lib, groupID: lib })?.libraryID
    let collection

    try {
      if (typeof libraryID === 'number') {
        try {
          collection = Zotero.Collections.getByLibraryAndKey(libraryID, path)
        }
        catch (err) {
          log.error('pull-export: resolve by key error:', err)
        }
        if (!collection) {
          try {
            collection = await Collection.get(`/${ libraryID }/${ path }`)
          }
          catch (err) {
            log.error('pull-export: resolve by path error:', err)
          }
        }
      }
    }
    catch (err) {
      if (err.code) return [ err.code, 'text/plain', err.message ]
      throw err
    }

    if (!collection) return [ NOT_FOUND, 'text/plain', `Could not export bibliography: path '${ path }' not found` ]

    return [ OK, 'text/plain', await Translators.exportItems({
      translatorID: Translators.getTranslatorId(translator),
      displayOptions: displayOptions(request),
      preferences: exportPreferences(request),
      scope: { type: 'collection', collection },
    }) ]
  }
}

class LibraryHandler {
  public supportedMethods = ['GET', 'POST']
  public supportedDataTypes = ['application/json']

  public async init(request) {
    const urlpath: string = Server.queryParams(request)['']
    if (!urlpath) return [ NOT_FOUND, 'text/plain', 'Could not export library: no path' ]

    try {
      const [ , libraryID, translator ] = urlpath.match(/\/?(?:([0-9]+)\/)?library\.([-0-9a-z]+)$/i)

      const library = Library.get({ libraryID, groupID: libraryID })
      if (!library) return [ NOT_FOUND, 'text/plain', `Could not export bibliography: library '${ urlpath }' does not exist` ]

      return [ OK, 'text/plain', await Translators.exportItems({
        translatorID: Translators.getTranslatorId(translator),
        displayOptions: displayOptions(request),
        preferences: exportPreferences(request),
        scope: { type: 'library', id: library.libraryID },
      }) ]
    }
    catch (err) {
      return [ SERVER_ERROR, 'text/plain', `${ err }` ]
    }
  }
}

class SelectedHandler {
  public supportedMethods = ['GET', 'POST']
  public supportedDataTypes = ['application/json']

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
        preferences: exportPreferences(request),
        scope: { type: 'items', items },
      }) ]
    }
    catch (err) {
      return [ SERVER_ERROR, 'text/plain', `${ err }` ]
    }
  }
}

class ItemHandler {
  public supportedMethods = ['GET', 'POST']
  public supportedDataTypes = ['application/json']

  public async init(request) {
    await Zotero.BetterBibTeX.ready

    try {
      const params = Server.queryParams(request)
      const { libraryID, library, groupID, group, translator } = params as unknown as { libraryID?: number; library?: string; groupID?: number; group: string; translator: string }
      const $libraryID = Library.get({ libraryID, library, groupID, group })?.libraryID

      if (typeof $libraryID !== 'number') return [ BAD_REQUEST, 'text/plain', `${JSON.stringify({ libraryID, library, groupID, group })} not found` ]

      const citationKeys: string[] = Array.from(new Set(params.citationKeys.split(',').filter(k => k)))
      if (!citationKeys.length) return [ SERVER_ERROR, 'text/plain', 'no citation keys provided' ]

      if (!translator) return [ SERVER_ERROR, 'text/plain', 'no translator selected' ]
      const translatorID = Translators.getTranslatorId(translator)
      if (!translatorID) return [ SERVER_ERROR, 'text/plain', `translator ${translator} not found` ]

      const response: {
        items: Record<string, any>
        zotero: Record<string, { itemID: number; uri: string }>
        errors: Record<string, string>
      } = { items: {}, zotero: {}, errors: {}}

      const itemIDs: Record<string, number> = {}
      for (const citationKey of citationKeys) {
        const key = Zotero.BetterBibTeX.KeyManager.find({ where: { libraryID: $libraryID, citationKey }})

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
        preferences: exportPreferences(request),
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
            throw new Error(`Unexpected translator ${ translatorID } from ${ translator }`)
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
    Server.register('/better-bibtex/export', Handler)
    Server.register('/better-bibtex/export/item', ItemHandler)
    Server.register([ '/better-bibtex/export/collection', '/better-bibtex/collection' ], CollectionHandler)
    Server.register([ '/better-bibtex/export/library', '/better-bibtex/library' ], LibraryHandler)
    Server.register([ '/better-bibtex/export/selected', '/better-bibtex/select' ], SelectedHandler)
    Server.startup()
  },

  shutdown: async () => { // eslint-disable-line @typescript-eslint/require-await
    Server.shutdown()
  },
})
