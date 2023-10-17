/* eslint-disable @typescript-eslint/no-unsafe-return */
const OK = 200
const SERVER_ERROR = 500
const NOT_FOUND = 404
const CONFLICT = 409
const BAD_REQUEST = 400

import { Translators } from './translators'
import { get as getCollection } from './collection'
import { get as getLibrary } from './library'
import { getItemsAsync } from './get-items-async'
import { fromPairs } from './object'
import { $and } from './db/loki'

function displayOptions(request) {
  const isTrue = new Set([ 'y', 'yes', 'true' ])
  const query = request.query || {}

  return {
    exportCharset: query.exportCharset || 'utf8',
    exportNotes: isTrue.has(query.exportNotes),
    useJournalAbbreviation: isTrue.has(query.useJournalAbbreviation),
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

      return [ OK, 'text/plain', await Translators.exportItems({
        translatorID: Translators.getTranslatorId(translator),
        displayOptions: displayOptions(request),
        scope: { type: 'collection', collection },
      })]

    }
    catch (err) {
      return [{ notfound: NOT_FOUND, duplicate: CONFLICT, error: SERVER_ERROR}[err.kind || 'error'], 'text/plain', `${err}`]
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

      return [OK, 'text/plain', await Translators.exportItems({
        translatorID: Translators.getTranslatorId(translator),
        displayOptions: displayOptions(request),
        scope: { type: 'library', id: libID },
      })]

    }
    catch (err) {
      return [SERVER_ERROR, 'text/plain', `${err}`]
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

      if (translator === 'quick-copy') {
        const format = Zotero.Prefs.get('export.quickCopy.setting')
        if (Zotero.QuickCopy.unserializeSetting(format).mode !== 'bibliography') throw new Error('formatted-citations requires the Zotero default quick-copy format to be set to a citation style')
        return [OK, 'text/plain', Zotero.QuickCopy.getContentFromItems(items, format, null, true).text ]
      }

      return [OK, 'text/plain', await Translators.exportItems({
        translatorID: Translators.getTranslatorId(translator),
        displayOptions: displayOptions(request),
        scope: { type: 'items', items },
      })]
    }
    catch (err) {
      return [SERVER_ERROR, 'text/plain', `${err}`]
    }
  }
}

function isSet(v) {
  return v ? 1 : 0
}
Zotero.Server.Endpoints['/better-bibtex/export/item'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    await Zotero.BetterBibTeX.ready

    try {
      let { translator, citationKeys, groupID, libraryID, library, group, pandocFilterData } = request.query
      if ((isSet(libraryID) + isSet(library) + isSet(groupID) + isSet(group)) > 1) {
        return [BAD_REQUEST, 'text/plain', 'specify at most one of library(/ID) or group(/ID)' ]
      }
      else if (libraryID) {
        if (!libraryID.match(/^[0-9]+$/)) return [BAD_REQUEST, 'text/plain', `${libraryID} is not a number` ]
        libraryID = parseInt(libraryID)
      }
      else if (groupID) {
        if (!groupID.match(/^[0-9]+$/)) return [BAD_REQUEST, 'text/plain', `${libraryID} is not a number` ]
        try {
          groupID = parseInt(groupID)
          libraryID = Zotero.Groups.getAll().find(g => g.groupID === groupID).libraryID
        }
        catch (err) {
          libraryID = null
        }
      }
      else if (library || group) {
        libraryID = getLibrary(library || group).libraryID
      }
      else {
        libraryID = Zotero.Libraries.userLibraryID
      }

      citationKeys = Array.from(new Set(citationKeys.split(',').filter(k => k)))
      if (!citationKeys.length) return [ SERVER_ERROR, 'text/plain', 'no citation keys provided' ]

      const translatorID = Translators.getTranslatorId(translator)
      if (!translator || !translatorID) return [ SERVER_ERROR, 'text/plain', 'no translator selected' ]

      const response: { items: Record<string, any>, zotero: Record<string, { itemID: number, uri: string }>, errors: Record<string, string> } = { items: {}, zotero: {}, errors: {} }

      const itemIDs: Record<string, number> = {}
      for (const citekey of citationKeys) {
        const key = Zotero.BetterBibTeX.KeyManager.keys.find($and({ libraryID, citekey }))

        switch (key.length) {
          case 0:
            response.errors[citekey] = 'not found'
            break
          case 1:
            itemIDs[citekey] = key[0].itemID
            break
          default:
            response.errors[citekey] = `${key.length} items found with key "${citekey}"`
            break
        }
      }

      if (!Object.keys(itemIDs).length) return [ SERVER_ERROR, 'text/plain', 'no items found' ]
      // itemID => zotero item
      const items = fromPairs((await getItemsAsync(Object.values(itemIDs))).map(item => [ item.itemID , item ]))
      let contents = await Translators.exportItems({translatorID, displayOptions: displayOptions(request), scope: { type: 'items', items: Object.values(items) }})

      if (pandocFilterData) {
        let filtered_items
        switch (Translators.byId[translatorID]?.label) {
          case 'Better CSL JSON':
            filtered_items = JSON.parse(contents)
            break
          case 'BetterBibTeX JSON':
            filtered_items = JSON.parse(contents).items
            break
          default:
            throw new Error(`Unexpected translator ${translatorID}`)
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

      return [OK, 'text/plain', contents ]
    }
    catch (err) {
      return [SERVER_ERROR, 'text/plain', `${err}`]
    }
  }
}
