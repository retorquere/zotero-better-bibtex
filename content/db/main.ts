import { XULoki as Loki } from './loki'
import { Preference } from '../prefs'
import { schema } from '../../gen/preferences/meta'
import { getItemsAsync } from '../get-items-async'

import { SQLite } from './store/sqlite'
import { log } from '../logger'

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
  public async init() {
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
      const length = autoexport.data.length
      autoexport.data = autoexport.data.filter(doc => {
        const err = autoexport.validationError(doc)
        if (err) {
          log.debug('scrubbing: auto-export validation error:', err, doc)
          return false
        }
        return true
      })
      if (length !== autoexport.data.length) {
        log.debug('scrubbing: stripping autoexport errors:', length - autoexport.data.length)
        autoexport.ensureId()
        autoexport.ensureAllIndexes(true)
        log.debug('scrubbing: stripping autoexport errors: rebuilt indices')
      }

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

      // old bibtex*: entries
      const re = /(?:^|\s)bibtex\*:[^\S\n]*([^\s]*)(?:\s|$)/
      const itemIDs = await Zotero.DB.columnQueryAsync('SELECT itemID FROM items')
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
