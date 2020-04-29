declare const Zotero: any

import { Translator } from '../lib/translator'

import { debug } from '../lib/debug'
import * as itemfields from '../../gen/itemfields'
import * as Extra from '../../content/extra'
import * as ExtraFields from '../../gen/extra-fields.json'

const validCSLTypes = [
  'article',
  'article-magazine',
  'article-newspaper',
  'article-journal',
  'review',
  'review-book',
  'bill',
  'broadcast',
  'dataset',
  'figure',
  'graphic',
  'interview',
  'legislation',
  'legal_case',
  'map',
  'motion_picture',
  'musical_score',
  'patent',
  'post',
  'post-weblog',
  'personal_communication',
  'song',
  'speech',
  'treaty',
  'webpage',
  'book',
  'chapter',
  'entry',
  'entry-dictionary',
  'entry-encyclopedia',
  'manuscript',
  'pamphlet',
  'paper-conference',
  'report',
  'thesis',
]

const keyOrder = [
  'id',
  'year',
  'season',
  'month',
  'day',
  'circa',
].reduce((acc, field, idx, fields) => { acc[field] = idx + 1; return acc }, {})

const prefix = {
  zotero: 'zotero:',
  csl: 'csl:',
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let CSLExporter = new class { // tslint:disable-line:variable-name
  public flush: Function // will be added by JSON/YAML exporter
  public serialize: Function // will be added by JSON/YAML exporter
  public date2CSL: Function // will be added by JSON/YAML exporter

  public initialize() {
    const postscript = Translator.preferences.postscript

    if (typeof postscript === 'string' && postscript.trim() !== '') {
      try {
        this.postscript = new Function('reference', 'item', 'Translator', 'Zotero', postscript) as (reference: any, item: any) => void
        debug(`Installed postscript: ${JSON.stringify(postscript)}`)
      } catch (err) {
        if (Translator.preferences.testing) throw err
        debug(`Failed to compile postscript: ${err}\n\n${JSON.stringify(postscript)}`)
      }
    }
  }
  public postscript(reference, item, _translator, _zotero) {} // tslint:disable-line:no-empty

  public doExport() {
    let exportCSLZoteroID = false
    try { exportCSLZoteroID = Zotero.getOption('exportCSLZoteroID') } catch (err) {}
    const items = []
    const order: { citekey: string, i: number}[] = []
    for (const item of Translator.items()) {
      if (item.itemType === 'note' || item.itemType === 'attachment') continue

      order.push({ citekey: item.citekey, i: items.length })

      let cached: Types.DB.Cache.ExportedItem
      if (cached = Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options, Translator.preferences)) {
        items.push(cached.reference)
        continue
      }

      itemfields.simplifyForExport(item)

      if (!Zotero.BetterBibTeX.worker()) Object.assign(item, Extra.get(item.extra, null, 'csl')) // for the worker version, this has already been done so that itemToCSLJSON works

      if (item.accessDate) { // WTH is Juris-M doing with those dates?
        item.accessDate = item.accessDate.replace(/T?[0-9]{2}:[0-9]{2}:[0-9]{2}.*/, '').trim()
      }

      let csl = Zotero.Utilities.itemToCSLJSON(item)
      if (exportCSLZoteroID) csl.zotero = { itemID: item.itemID, uri: item.uri }

      // 637
      delete csl['publisher-place']
      delete csl['archive-place']
      delete csl['event-place']
      delete csl['original-publisher-place']
      delete csl['publisher-place']
      if (item.place) csl[item.itemType === 'presentation' ? 'event-place' : 'publisher-place'] = item.place

      // https://github.com/retorquere/zotero-better-bibtex/issues/811#issuecomment-347165389
      if (item.ISBN) csl.ISBN = item.ISBN

      delete csl.authority
      if (item.itemType === 'videoRecording' && csl.type === 'video') csl.type = 'motion_picture'

      if (item.date) {
        const parsed = Zotero.BetterBibTeX.parseDate(item.date)
        if (parsed.type) csl.issued = this.date2CSL(parsed) // possible for there to be an orig-date only
        if (parsed.orig) csl['original-date'] = this.date2CSL(parsed.orig)
      }
      if (item.accessDate) csl.accessed = this.date2CSL(Zotero.BetterBibTeX.parseDate(item.accessDate))

      for (const [name, value] of Object.entries(item.extraFields.kv)) {
        if (name.startsWith(prefix.zotero)) continue

        if (name.startsWith(prefix.csl)) {
          for (const field of name.substring(prefix.csl.length).split('+')) {
            csl[field] = value
          }
          delete item.extraFields.kv[name]
          continue
        }

        const ef = ExtraFields[name]
        if (!ef || !ef.csl) continue

        if (name === 'type') {
          if (validCSLTypes.includes(value)) csl.type = value

        } else if (ef.type === 'date') {
          csl[ef.csl] = this.date2CSL(Zotero.BetterBibTeX.parseDate(value))

        } else {
          csl[ef.csl] = value

        }

        delete item.extraFields.kv[name]
      }

      for (const [name, value] of Object.entries(item.extraFields.creator)) {
        if (name.includes(':')) continue
        const ef = ExtraFields[name]
        csl[ef.csl] = value.map(Extra.cslCreator)

        delete item.extraFields.creator[name]
      }

      [csl.journalAbbreviation, csl['container-title-short']] = [csl['container-title-short'], csl.journalAbbreviation]

      /* ham-fisted workaround for #365 */
      if ((csl.type === 'motion_picture' || csl.type === 'broadcast') && csl.author && !csl.director) [csl.author, csl.director] = [csl.director, csl.author]

      csl.id = item.citekey

      /* Juris-M workarounds to match Zotero as close as possible */
      for (const kind of ['translator', 'author', 'editor', 'director', 'reviewed-author']) {
        for (const creator of csl[kind] || []) {
          delete creator.multi
        }
      }
      delete csl.multi
      delete csl.system_id

      if (csl.type === 'broadcast' && csl.genre === 'television broadcast') delete csl.genre

      let cache
      try {
        cache = this.postscript(csl, item, Translator, Zotero)
      } catch (err) {
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

    order.sort((a, b) => a.citekey.localeCompare(b.citekey, undefined, { sensitivity: 'base' }))

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
      for (const field of Object.keys(obj).sort(this.keySort)) {
        const value = obj[field]
        delete obj[field]
        obj[field] = this.sortObject(value)
      }
    }
    return obj
  }
}
