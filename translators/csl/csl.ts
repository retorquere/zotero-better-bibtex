declare const Translator: ITranslator

declare const Zotero: any

import { debug } from '../lib/debug'
import * as itemfields from '../../gen/itemfields'

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

function keySort(a, b) {
  if (a === 'id' && b !== 'id') return -1
  if (a !== 'id' && b === 'id') return -1
  return a.localeCompare(b, undefined, { sensitivity: 'base' })
}

function sortObject(obj) {
  if (!Array.isArray(obj) && obj && typeof obj === 'object') {
    for (const field of Object.keys(obj).sort(keySort)) {
      const value = obj[field]
      delete obj[field]
      obj[field] = sortObject(value)
    }
  }
  return obj
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
        this.postscript = new Function('reference', 'item', postscript) as (reference: any, item: any) => void
        Zotero.debug(`Installed postscript: ${JSON.stringify(postscript)}`)
      } catch (err) {
        if (Translator.preferences.testing) throw err
        Zotero.debug(`Failed to compile postscript: ${err}\n\n${JSON.stringify(postscript)}`)
      }
    }
  }
  public postscript(reference, item) {} // tslint:disable-line:no-empty

  public doExport() {
    let items = []
    const order = []

    let item: ISerializedItem
    while (item = Zotero.nextItem()) {
      if (item.itemType === 'note' || item.itemType === 'attachment') continue

      order.push({ id: item.citekey, index: items.length })

      let cached: Types.DB.Cache.ExportedItem
      if (cached = Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options, Translator.preferences)) {
        items.push(cached.reference)
        continue
      }

      itemfields.simplifyForExport(item)
      Object.assign(item, Zotero.BetterBibTeX.extractFields(item))

      if (item.accessDate) { // WTH is Juris-M doing with those dates?
        item.accessDate = item.accessDate.replace(/T?[0-9]{2}:[0-9]{2}:[0-9]{2}.*/, '').trim()
      }

      let csl = Zotero.Utilities.itemToCSLJSON(item)

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

      debug('extracted:', item.extraFields)
      for (let [name, {type, value}] of Object.entries(item.extraFields.csl)) {
        switch (name) {
          case 'type':
            if (validCSLTypes.includes(value)) csl.type = value
            continue

          case 'doi':
          case 'isbn':
          case 'issn':
          case 'pmcid':
          case 'pmid':
          case 'url':
            name = name.toUpperCase()
            break
        }

        switch (type) {
          case 'date':
            csl[name] = this.date2CSL(Zotero.BetterBibTeX.parseDate(value))
            break

          case 'creator':
            csl[name] = []
            for (let creator of value) {
              if (creator.name) {
                csl[name].push({ literal: creator.name })
              } else {
                creator = {family: creator.name || creator.lastName || '', given: creator.firstName || '', isInstitution: ((creator.name || creator.fieldMode === 1) ? 1 : undefined)}
                Zotero.BetterBibTeX.parseParticles(creator)
                csl[name].push(creator)
              }
            }
            break

          default:
            csl[name] = value
        }
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
        cache = this.postscript(csl, item)
      } catch (err) {
        if (Translator.preferences.testing && !Zotero.getHiddenPref('better-bibtex.postscriptProductionMode')) throw err
        cache = false
      }

      for (const field of Translator.skipFields) {
        delete csl[field]
      }
      if (Translator.preferences.testing || Translator.preferences.sorted) csl = sortObject(csl)
      csl = this.serialize(csl)

      if (typeof cache !== 'boolean' || cache) Zotero.BetterBibTeX.cacheStore(item.itemID, Translator.options, Translator.preferences, csl)

      items.push(csl)
    }

    if (Translator.preferences.testing || Translator.preferences.sorted) {
      order.sort((a, b) => a.id.localeCompare(b.id, undefined, { sensitivity: 'base' }))
      items = order.map(i => items[i.index])
    }

    Zotero.write(this.flush(items))
  }
}
