import { XULoki as Loki } from './loki'
import { Preference } from '../prefs'
import { schema } from '../../gen/preferences/meta'
import { getItemsAsync } from '../get-items-async'
import * as ZoteroDB from './zotero'

import { SQLite } from './store/sqlite'
import { log } from '../logger'
import { orchestrator } from '../orchestrator'

import * as Translators from '../../gen/translators.json'

export function scrubAutoExport(ae: any): void { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  const translator = schema.translator[Translators.byId[ae.translatorID].label]
  const properties = translator.autoexport ? translator.autoexport.properties : {}
  for (const k of Object.keys(ae)) {
    if (!properties[k]) delete ae[k]
  }
  delete ae.worker

  return ae // eslint-disable-line @typescript-eslint/no-unsafe-return
}

class Main extends Loki {
  constructor(name, options) {
    super(name, options)

    orchestrator.add('database', {
      description: 'citekey database',
      needs: ['sqlite'],
      startup: async () => { await this.init() },
      shutdown: async () => {
        const store = this.persistenceAdapter?.constructor?.name || 'Unknown'
        this.throttledSaves = false
        log.debug(`Loki.${store}.shutdown: saving ${this.filename}`)
        await this.saveDatabaseAsync()
        log.debug(`Loki.${store}.shutdown: closing ${this.filename}`)
        await this.closeAsync()
        log.debug(`Loki.${store}.shutdown: closed ${this.filename}`)
      },
    })
  }

  private async init() {
    await this.loadDatabaseAsync()

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
    if (Preference.scrubDatabase) {
      log.debug('scrubbing: stripping citekey extra')
      for (const citekey of citekeys.find()) {
        if (typeof(citekey.extra) !== 'undefined') {
          delete citekey.extra
          citekeys.update(citekey)
        }
      }
      log.debug('scrubbing: stripping citekey extra done')
    }

    if (Zotero.Libraries.userLibraryID) {
      for (const citekey of citekeys.where(ck => ck.libraryID === 1 || !ck.libraryID )) {
        citekey.libraryID = Zotero.Libraries.userLibraryID
        citekeys.update(citekey)
      }
    }

    if (Zotero.Prefs.get('translators.better-bibtex.logEvents')) {
      for (const event of ['insert', 'delete', 'update']) {
        (e => {
          citekeys.on(e, record => { log.debug('LokiJS', e, record) })
        })(event)
      }
    }

    const config = {
      indices: [
        'type',
        'id',
        'status',
        'path',
        'translatorID',

        ...schema.autoExport.displayOptions,
        ...schema.autoExport.preferences,
      ],
      unique: [ 'path' ],
      // logging: true,
      schema: {
        type: 'object',
        discriminator: { propertyName: 'translatorID' },
        oneOf: [],
      },
    }
    for (const translator of Object.values(schema.translator)) {
      if (translator.autoexport) config.schema.oneOf.push(translator.autoexport)
    }

    const autoexport = this.schemaCollection('autoexport', config)

    if (Preference.scrubDatabase) {
      log.debug('scrubbing: stripping autoexport')
      // directly change the data objects and rebuild indexes https://github.com/techfort/LokiJS/issues/660
      let removed = 0
      autoexport.data = autoexport.data.filter(doc => {
        const err = autoexport.validationError(doc)
        if (err) {
          log.debug('scrubbing: auto-export validation error:', err, doc)
          removed += 1
          return false
        }
        if (!doc.meta || typeof doc.$loki !== 'number') {
          log.debug('scrubbing: auto-export missing metadata:', doc)
          removed += 1
          return false
        }
        return true
      })
      if (removed) {
        log.debug('scrubbing: stripping autoexport errors:', removed)
        autoexport.ensureId()
        autoexport.ensureAllIndexes(true)
        log.debug('scrubbing: stripping autoexport errors: rebuilt indices')
      }
      log.debug('scrubbing: stripping autoexport done')

      log.debug('scrubbing: fixing indices')
      // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
      for (const [name, coll] of Object.entries({ citekeys, autoexport })) {
        let corrupt
        try {
          corrupt = coll.checkAllIndexes({ repair: true })
        }
        catch (err) {
          log.debug('scrubbing: index error:', name, err)
          corrupt = [ '*' ]
          coll.ensureAllIndexes(true)
        }
        if (corrupt.length > 0) {
          for (const index of corrupt) {
            if (index === '*') {
              log.debug(`scrubbing: LokiJS: rebuilt index ${name}.${index}`)
            }
            else {
              log.debug(`scrubbing: LokiJS: corrupt index ${name}.${index} repaired`)
            }
          }
        }
      }
      log.debug('scrubbing: fixing indices done')

      log.debug('scrubbing: old bibtex: lines in extra')
      // old bibtex*: entries
      const re = /(?:^|\s)bibtex\*:[^\S\n]*([^\s]*)(?:\s|$)/

      // stupid "Please enter a LIKE clause with bindings"
      const itemIDs = await ZoteroDB.columnQueryAsync(`
        SELECT item.itemID, item.key, extra.value as extra
        FROM items item

        LEFT JOIN itemData extraField ON extraField.itemID = item.itemID
        JOIN fields ON fields.fieldID = extraField.fieldID AND fields.fieldName = 'extra'
        LEFT JOIN itemDataValues extra ON extra.valueID = extraField.valueID AND extra.value LIKE ?
        JOIN itemTypes ON itemTypes.itemTypeID = item.itemTypeID AND itemTypes.typeName NOT IN ('attachment', 'note', 'annotation', 'note')
        WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems) AND item.itemID NOT IN (SELECT itemID from feedItems)
      `, ['%bibtex:%'])

      log.debug(`scrubbing: old bibtex: ${itemIDs.length} lines in extra`)
      const items = await getItemsAsync(itemIDs)
      for (const item of items) {
        const extra = item.getField('extra')
        if (!extra) continue

        const clean = extra.replace(re, '\n').trim()

        if (clean === extra) continue

        log.debug('scrubbing: replaced old bibtex: syntax')

        item.setField('extra', clean)
        await item.saveTx()
      }
      log.debug('scrubbing: old bibtex: lines in extra done')

      Preference.scrubDatabase = false
      log.debug('scrubbing: completed')
    }

    autoexport.on(['pre-insert', 'pre-update'], (ae: { path: string, $loki: number }) => {
      autoexport.removeWhere({ $and: [ { path: ae.path }, { $loki: { $ne: ae.$loki } } ] })
    })
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const DB = new Main('better-bibtex', { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  autosave: true,
  autosaveInterval: 5000,
  autosaveOnIdle: true,
  adapter: new SQLite(),
})
