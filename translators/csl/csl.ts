/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */

declare const Zotero: any

import { Translator } from '../lib/translator'

import * as itemfields from '../../gen/items/items'
import * as Extra from '../../content/extra'
import * as ExtraFields from '../../gen/items/extra-fields.json'
import { log } from '../../content/logger'
import { worker } from '../../content/worker'

const validCSLTypes: string[] = require('../../gen/items/csl-types.json')

const keyOrder = [
  'id',
  'year',
  'season',
  'month',
  'day',
  'circa',
].reduce((acc, field, idx) => { acc[field] = idx + 1; return acc }, {})

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const CSLExporter = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public flush: Function // will be added by JSON/YAML exporter
  public serialize: Function // will be added by JSON/YAML exporter
  public date2CSL: Function // will be added by JSON/YAML exporter

  public initialize() {
    const postscript = Translator.preferences.postscript

    if (typeof postscript === 'string' && postscript.trim() !== '') {
      try {
        this.postscript = new Function('reference', 'item', 'Translator', 'Zotero', postscript) as (reference: any, item: any) => boolean
        log.debug(`Installed postscript: ${JSON.stringify(postscript)}`)
      }
      catch (err) {
        if (Translator.preferences.testing) throw err
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        log.error(`Failed to compile postscript: ${err}\n\n${JSON.stringify(postscript)}`)
      }
    }
  }
  public postscript(_reference, _item, _translator, _zotero) {} // eslint-disable-line @typescript-eslint/no-empty-function

  public doExport() {
    const items = []
    const order: { citationKey: string, i: number}[] = []
    for (const item of Translator.items()) {
      if (item.itemType === 'note' || item.itemType === 'attachment') continue

      order.push({ citationKey: item.citationKey, i: items.length })

      let cached: Types.DB.Cache.ExportedItem
      if (cached = Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options, Translator.preferences)) {
        items.push(cached.reference)
        continue
      }

      itemfields.simplifyForExport(item)
      if (item.accessDate) { // WTH is Juris-M doing with those dates?
        item.accessDate = item.accessDate.replace(/T?[0-9]{2}:[0-9]{2}:[0-9]{2}.*/, '').trim()
      }

      Object.assign(item, Extra.get(item.extra, 'csl'))

      // until export translators can be async, itemToCSLJSON must run before the translator starts, so it actually doesn't do anything in a worker context
      // so re-assigne the extracted extra here
      let csl = Zotero.Utilities.itemToCSLJSON(item)
      if (worker) csl.note = item.extra || undefined

      // 637
      /* TODO: is this still needed with the new extra-parser?
      delete csl['publisher-place']
      delete csl['archive-place']
      delete csl['event-place']
      delete csl['original-publisher-place']
      delete csl['publisher-place']
      */
      if (item.place) csl[item.itemType === 'presentation' ? 'event-place' : 'publisher-place'] = item.place

      // https://github.com/retorquere/zotero-better-bibtex/issues/811#issuecomment-347165389
      if (item.ISBN) csl.ISBN = item.ISBN

      delete csl.authority

      if (item.itemType === 'videoRecording' && csl.type === 'video') csl.type = 'motion_picture'

      if (csl.journalAbbreviation) [csl.journalAbbreviation, csl['container-title-short']] = [csl['container-title-short'], csl.journalAbbreviation]

      if (item.date) {
        const parsed = Zotero.BetterBibTeX.parseDate(item.date)
        if (parsed.type) csl.issued = this.date2CSL(parsed) // possible for there to be an orig-date only
        if (parsed.orig) csl['original-date'] = this.date2CSL(parsed.orig)
      }

      if (item.accessDate) csl.accessed = this.date2CSL(Zotero.BetterBibTeX.parseDate(item.accessDate))

      /* ham-fisted workaround for #365 */
      if ((csl.type === 'motion_picture' || csl.type === 'broadcast') && csl.author && !csl.director) [csl.author, csl.director] = [csl.director, csl.author]

      csl.id = item.citationKey

      if (csl.type === 'broadcast' && csl.genre === 'television broadcast') delete csl.genre

      // special case for #587... not pretty
      // checked separately because .type isn't actually a CSL var so wouldn't pass the ef.type test below
      if (!validCSLTypes.includes(item.extraFields.kv['csl-type']) && validCSLTypes.includes(item.extraFields.kv.type)) {
        csl.type = item.extraFields.kv.type
        delete item.extraFields.kv.type
      }

      for (const [name, value] of Object.entries(item.extraFields.kv)) {
        const ef = ExtraFields[name]
        if (!ef.csl) continue

        if (ef.type === 'date') {
          csl[name] = this.date2CSL(Zotero.BetterBibTeX.parseDate(value))
        }
        else if (name === 'csl-type') {
          if (!validCSLTypes.includes(value)) continue // and keep the kv variable, maybe for postscripting
          csl.type = value
        }
        else if (!csl[name]) {
          csl[name] = value
        }

        delete item.extraFields.kv[name]
      }

      for (const [field, value] of Object.entries(item.extraFields.creator)) {
        if (!ExtraFields[field].csl) continue
        csl[field] = value.map(Extra.cslCreator)

        delete item.extraFields.creator[field]
      }

      /* Juris-M workarounds to match Zotero as close as possible */
      for (const kind of ['translator', 'author', 'editor', 'director', 'reviewed-author']) {
        for (const creator of csl[kind] || []) {
          delete creator.multi
        }
      }
      delete csl.multi
      delete csl.system_id

      let cache
      try {
        cache = this.postscript(csl, item, Translator, Zotero)
      }
      catch (err) {
        if (Translator.preferences.testing && !Translator.preferences.ignorePostscriptErrors) throw err
        cache = false
      }

      for (const field of Translator.skipFields) {
        delete csl[field]
      }
      csl = this.sortObject(csl)
      csl = this.serialize(csl)

      if (typeof cache !== 'boolean' || cache) Zotero.BetterBibTeX.cacheStore(item.itemID, Translator.options, Translator.preferences, csl)

      items.push(csl)
    }

    order.sort((a, b) => a.citationKey.localeCompare(b.citationKey, undefined, { sensitivity: 'base' }))
    Zotero.write(this.flush(order.map(o => items[o.i])))
  }

  public keySort(a, b) {
    const oa = keyOrder[a]
    const ob = keyOrder[b]

    if (oa && ob) return oa - ob
    if (oa) return -1
    if (ob) return 1
    return a.localeCompare(b, undefined, { sensitivity: 'base' })
  }

  private sortObject(obj) {
    if (obj && !Array.isArray(obj) && typeof obj === 'object') {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      for (const field of Object.keys(obj).sort(this.keySort)) {
        const value = obj[field]
        delete obj[field]
        obj[field] = this.sortObject(value)
      }
    }
    return obj
  }
}

