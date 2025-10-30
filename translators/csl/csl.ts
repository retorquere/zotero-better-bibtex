declare const Zotero: any

import { Translation } from '../lib/translator.js'

import { simplifyForExport } from '../../gen/items/simplify.js'
import { Fields as ParsedExtraFields, get as getExtra, cslCreator } from '../../content/extra.js'
import type { ExportedItem } from '../../content/worker/cache.js'
import ExtraFields from '../../gen/items/extra-fields.json' with { type: 'json' }
import { log } from '../../content/logger.js'
import { RegularItem } from '../../gen/typings/serialized-item.js'
import * as postscript from '../lib/postscript.js'
import * as dateparser from '../../content/dateparser.js'
import { Date as CSLDate, Data as CSLItem } from 'csl-json'

type ExtendedItem = RegularItem & { extraFields: ParsedExtraFields }

import CSLField from '../../gen/items/csl.json' with { type: 'json' }

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
      simplifyForExport(item)
      if (item.accessDate) { // WTH is Juris-M doing with those dates?
        item.accessDate = item.accessDate.replace(/T?[0-9]{2}:[0-9]{2}:[0-9]{2}.*/, '').trim()
      }

      item.journalAbbreviation = item.journalAbbreviation || item.autoJournalAbbreviation

      let csl = Zotero.Utilities.Item.itemToCSLJSON(item)

      let m: RegExpMatchArray
      for (const field of ['page', 'issue', 'volume']) {
        log.debug('3327:', field, csl[field])
        if (csl[field]) {
          log.debug(field, csl[field].split(/(\s*,\s*)/))
          csl[field] = csl[field]
            .split(/(\s*,\s*)/)
            .map((range: string) => {
              log.debug('3327: range:', range.match(/^(\d+)-(\d+)$/))
              return (m = range.match(/^(\d+)-(\d+)$/)) ? `${m[1]}\u2013${m[2]}` : range
            })

            .join('')
        }
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
      if (!CSLField.type.enum.includes(item.extraFields.kv['csl-type']) && CSLField.type.enum.includes(item.extraFields.kv.type)) {
        csl.type = item.extraFields.kv.type
        delete item.extraFields.kv.type
      }

      for (const [ name, value ] of Object.entries(item.extraFields.kv)) {
        if (!value) continue

        const cslField = CSLField[name]
        if (cslField) {
          if (cslField.type === 'string' && cslField.enum?.includes(value)) {
            csl[name] = value
            delete item.extraFields.kv[name]
            continue
          }
          if (cslField.$ref === '#/definitions/date-variable') {
            csl[name] = this.date2CSL(dateparser.parse(value as string))
            delete item.extraFields.kv[name]
            continue
          }
          if (cslField.type === 'string' || (Array.isArray(cslField.type) || cslField.type.join(',') === 'number,string')) {
            csl[name] = value
            delete item.extraFields.kv[name]
            continue
          }
        }

        const ef = ExtraFields[name]
        if (!ef?.csl) continue

        if (ef.type === 'date') {
          csl[name] = this.date2CSL(dateparser.parse(value as string))
        }
        else if (name === 'csl-type') {
          if (!CSLField.type.enum.includes(value as string)) continue // and keep the kv variable, maybe for postscripting
          csl.type = value
        }
        else if (!csl[name]) {
          csl[name] = value
        }

        delete item.extraFields.kv[name]
      }

      for (const [ field, value ] of Object.entries(item.extraFields.creator)) {
        if (!ExtraFields[field].csl) continue
        csl[field] = (value as string[]).map(cslCreator)

        delete item.extraFields.creator[field]
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
