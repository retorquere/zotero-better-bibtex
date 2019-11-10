declare const Zotero: any

import { XULoki as Loki } from './loki'
import { Preferences as Prefs } from '../prefs'
import { getItemsAsync } from '../get-items-async'

import { Store } from './store'

import * as prefOverrides from '../../gen/preferences/auto-export-overrides.json'
import * as prefOverridesSchema from '../../gen/preferences/auto-export-overrides-schema.json'

class Main extends Loki {
  public async init() {
    await this.loadDatabaseAsync()

    const scrub = Prefs.get('scrubDatabase')

    const citekeys = this.schemaCollection('citekey', {
      indices: [ 'itemID', 'itemKey', 'libraryID', 'citekey', 'pinned' ],
      unique: [ 'itemID' ],
      logging: true,
      schema: {
        type: 'object',
        properties: {
          itemID: { type: 'integer' },
          itemKey: { type: 'string' },
          libraryID: { type: 'integer' },
          citekey: { type: 'string', minLength: 1 },
          pinned: { type: 'boolean', default: false },

          // LokiJS
          meta: { type: 'object' },
          $loki: { type: 'integer' },
        },
        required: [ 'itemID', 'libraryID', 'citekey', 'pinned' ],
        additionalProperties: false,
      },
    })

    // https://github.com/retorquere/zotero-better-bibtex/issues/1073
    if (scrub) {
      for (const citekey of citekeys.find()) {
        if (typeof(citekey.extra) !== 'undefined') {
          delete citekey.extra
          citekeys.update(citekey)
        }
      }
    }

    if (Zotero.Libraries.userLibraryID) {
      for (const citekey of citekeys.where(ck => ck.libraryID === 1 || !ck.libraryID )) {
        citekey.libraryID = Zotero.Libraries.userLibraryID
        citekeys.update(citekey)
      }
    }

    const autoexport = this.schemaCollection('autoexport', {
      indices: [
        'type',
        'id',
        'status',
        'path',
        'translatorID',

        'useJournalAbbreviation',
        'exportNotes',

        ...prefOverrides,
      ],
      unique: [ 'path' ],
      logging: true,
      schema: {
        type: 'object',
        properties: {
          type: { enum: [ 'collection', 'library' ] },
          id: { type: 'integer' },
          path: { type: 'string', minLength: 1 },
          status: { enum: [ 'scheduled', 'running', 'done', 'error' ] },
          translatorID: { type: 'string', minLength: 1 },

          // options
          exportNotes: { type: 'boolean', default: false },
          useJournalAbbreviation: { type: 'boolean', default: false },

          // prefs
          ...prefOverridesSchema,

          error: { type: 'string', default: '' },

          // LokiJS
          meta: { type: 'object' },
          $loki: { type: 'integer' },
        },
        required: [ 'type', 'id', 'path', 'status', 'translatorID', 'exportNotes', 'useJournalAbbreviation', ...prefOverrides ],

        additionalProperties: false,
      },
    })

    for (const ae of autoexport.find()) {
      let update = false

      if (ae.updated) {
        delete ae.updated
        update = true
      }

      for (const pref of prefOverrides) {
        if (typeof ae[pref] === 'undefined') {
          ae[pref] = Prefs.get(pref)
          update = true
        }
      }

      if (update) autoexport.update(ae)
    }

    if (scrub) {
      // directly change the data objects and rebuild indexes https://github.com/techfort/LokiJS/issues/660
      const length = autoexport.data.length
      autoexport.data = autoexport.data.filter(doc => typeof doc.$loki === 'number' && typeof doc.meta === 'object')
      if (length !== autoexport.data.length) {
        autoexport.ensureId()
        autoexport.ensureAllIndexes(true)
      }

      // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
      for (const [name, coll] of Object.entries({ citekeys, autoexport })) {
        let corrupt
        try {
          corrupt = coll.checkAllIndexes({ repair: true })
        } catch (err) {
          corrupt = [ '*' ]
          coll.ensureAllIndexes(true)
        }
        if (corrupt.length > 0) {
          for (const index of corrupt) {
            if (index === '*') {
              Zotero.logError(new Error(`LokiJS: rebuilt index ${name}.${index}`))
            } else {
              Zotero.logError(new Error(`LokiJS: corrupt index ${name}.${index} repaired`))
            }
          }
        }
      }

      // old bibtex*: entries
      const re = /(?:^|\s)bibtex\*:[^\S\n]*([^\s]*)(?:\s|$)/
      const itemIDs = await Zotero.DB.columnQueryAsync('SELECT itemID FROM items')
      const items = await getItemsAsync(itemIDs)
      for (const item of items) {
        const extra = item.getField('extra')
        if (!extra) continue

        const clean = extra.replace(re, '\n').trim()

        if (clean === extra) continue

        item.setField('extra', clean)
        await item.saveTx()
      }
    }
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let DB = new Main('better-bibtex', { // tslint:disable-line:variable-name
  autosave: true,
  autosaveInterval: 5000,
  autosaveOnIdle: true,
  adapter: new Store({ storage: 'sqlite' }),
})
