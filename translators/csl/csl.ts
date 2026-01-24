declare const Zotero: any

import { Translation } from '../lib/translator'

declare const dump: (msg: string) => void

import { ItemType } from '../../content/item-type'
import { Fields as ParsedExtraFields, get as getExtra, cslCreator } from '../../content/extra'
import type { ExportedItem } from '../../content/worker/cache'
import { log } from '../../content/logger'
import { Serialized } from '../../gen/typings/serialized'
import * as postscript from '../lib/postscript'
import * as dateparser from '../../content/dateparser'
import { Date as CSLDate, Data as CSLItem } from 'csl-json'

type ExtendedItem = Serialized.RegularItem & { extraFields: ParsedExtraFields }

import CSLMeta from '../../gen/items/csl.json' with { type: 'json' }

const keyOrder = [
  'id',
  'year',
  'season',
  'month',
  'day',
  'circa',
].reduce((acc, field, idx) => { acc[field] = idx + 1; return acc }, {})

export abstract class CSLExporter {
  private translation: Translation
  protected abstract flush(items: string[]): string
  protected abstract serialize(items: CSLItem): string
  protected abstract date2CSL(date: dateparser.ParsedDate): CSLDate

  constructor(translation: Translation) {
    this.translation = translation

    try {
      if (this.translation.collected.preferences.postscript.trim()) {
        this.postscript = postscript.postscript('csl', this.translation.collected.preferences.postscript)
      }
      else {
        this.postscript = postscript.noop
      }
    }
    catch (err) {
      this.postscript = postscript.noop
      log.error(`failed to install postscript\n${ this.translation.collected.preferences.postscript }`, err)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public postscript(_entry, _item, _translator, _zotero, _extra): postscript.Allow {
    return { cache: true, write: true }
  }

  public doExport(): void {
    const items = []
    for (const item of (this.translation.collected.items.regular as Generator<ExtendedItem, void, unknown>)) {
      let cached: ExportedItem
      if (!this.translation.collected.displayOptions.custom && (cached = Zotero.BetterBibTeX.Cache.fetch(item.itemID))) {
        items.push(cached.entry)
        continue
      }

      Object.assign(item, getExtra(item.extra, 'csl'))
      ItemType.simplifyForExport(item)
      if (item.accessDate) { // WTH is Juris-M doing with those dates?
        item.accessDate = item.accessDate.replace(/T?[0-9]{2}:[0-9]{2}:[0-9]{2}.*/, '').trim()
      }

      item.journalAbbreviation = item.journalAbbreviation || item.autoJournalAbbreviation

      let csl = Zotero.Utilities.Item.itemToCSLJSON(item)

      // #3327
      for (const field of ['page', 'issue', 'volume']) {
        if (csl[field]) csl[field] = csl[field].replace(/(?<=(^|,)\s*\d+)\s*-\s*(?=\d+\s*(,|$))/g, '\u2013')
      }

      csl['citation-key'] = item.citationKey
      if (this.translation.collected.displayOptions.custom) csl.custom = { uri: item.uri, itemID: item.itemID }

      if (Zotero.worker) csl.note = item.extra || undefined

      if (item.place) csl[item.itemType === 'presentation' ? 'event-place' : 'publisher-place'] = item.place

      // https://github.com/retorquere/zotero-better-bibtex/issues/811#issuecomment-347165389
      if (item.ISBN) csl.ISBN = item.ISBN

      if (item.itemType === 'videoRecording' && csl.type === 'video') csl.type = 'motion_picture'

      if (csl.journalAbbreviation) [ csl.journalAbbreviation, csl['container-title-short'] ] = [ csl['container-title-short'], csl.journalAbbreviation ]

      if (item.date) {
        const parsed = dateparser.parse(item.date)
        try {
          // preconvert both so the values get set only if both are convertable
          const issued = parsed.type ? this.date2CSL(parsed) : undefined // possible for there to be an orig-date only
          const original = parsed.orig ? this.date2CSL(parsed.orig) : undefined

          if (issued) csl.issued = issued
          if (original) csl['original-date'] = original
        }
        catch (err) {
          log.error('could not convert CSL date', { input: item.date, parsed }, err)
          csl.issued = { literal: item.date }
        }
      }

      if (item.accessDate) csl.accessed = this.date2CSL(dateparser.parse(item.accessDate))

      /* ham-fisted workaround for #365 */
      if ((csl.type === 'motion_picture' || csl.type === 'broadcast') && csl.author && !csl.director) [ csl.author, csl.director ] = [ csl.director, csl.author ]

      csl.id = item.citationKey

      if (csl.type === 'broadcast' && csl.genre === 'television broadcast') delete csl.genre

      const extraFields: ParsedExtraFields = structuredClone(item.extraFields)

      // special case for #587... not pretty
      // checked separately because .type isn't actually a CSL var so wouldn't pass the ef.type test below
      if (!CSLMeta.type.enum.includes(item.extraFields.kv['csl-type']) && CSLMeta.type.enum.includes(item.extraFields.kv.type)) {
        csl.type = item.extraFields.kv.type
        delete item.extraFields.kv.type
      }

      for (const [ fieldName, value ] of Object.entries(item.extraFields.kv)) {
        if (!value) continue

        const cslMeta = CSLMeta[fieldName]
        dump(`811: ${JSON.stringify({ fieldName, cslMeta: cslMeta || null, value })}\n`)
        if (!cslMeta) continue

        if (cslMeta.type === 'string' && (!cslMeta.enum || cslMeta.enum.includes(value))) {
          csl[fieldName] = value
        }
        else if (cslMeta.$ref === '#/definitions/date-variable') {
          csl[fieldName] = this.date2CSL(dateparser.parse(value))
        }
        else if (cslMeta.type === 'string' || (Array.isArray(cslMeta.type) && cslMeta.type.join(',') === 'number,string')) {
          csl[fieldName] = value
        }
        else if (fieldName === 'csl-type') {
          if (!cslMeta.type.enum.includes(value)) continue // and keep the kv variable, maybe for postscripting
          csl.type = value
        }
        else {
          continue // skip out of the loop, keep the kv-var
        }

        delete item.extraFields.kv[fieldName]
      }

      dump(`2015: ${JSON.stringify(item.extraFields.creator)}\n`)
      for (const [ fieldName, value ] of Object.entries(item.extraFields.creator)) {
        dump(`2015: ${fieldName} => ${JSON.stringify(CSLMeta[fieldName] || null)}\n`)
        if (CSLMeta[fieldName]) {
          csl[fieldName] = [ ...(csl[fieldName] || []), ...value.map(cslCreator) ]
          delete item.extraFields.creator[fieldName]
        }
      }

      /* Juris-M workarounds to match Zotero as close as possible */
      for (const kind of [ 'translator', 'author', 'editor', 'director', 'reviewed-author' ]) {
        for (const creator of csl[kind] || []) {
          delete creator.multi
        }
      }
      delete csl.multi
      delete csl.system_id

      let allow: postscript.Allow = { cache: true, write: true }
      try {
        allow = this.postscript(csl, item, this.translation, Zotero, extraFields)
      }
      catch (err) {
        log.error('CSL.postscript error:', err)
        allow.cache = false
      }

      if (this.translation.skipField) {
        for (const field of Object.keys(csl)) {
          const fullname = `csl.${ csl.type }.${ field }`
          if (fullname.match(this.translation.skipField)) delete csl[field]
        }
      }

      csl = this.sortObject(csl)
      csl = this.serialize(csl)

      if (allow.cache) Zotero.BetterBibTeX.Cache.store(item.itemID, csl, {})

      if (allow.write) items.push(csl)
    }

    this.translation.output.body += this.flush(items)
  }

  public keySort(a: string, b: string): number {
    const oa = keyOrder[a]
    const ob = keyOrder[b]

    if (oa && ob) return oa - ob
    if (oa) return -1
    if (ob) return 1
    return a.localeCompare(b, undefined, { sensitivity: 'base' })
  }

  private sortObject(obj: any): any {
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
