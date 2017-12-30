import { ITranslator } from '../../gen/translator'
declare const Translator: ITranslator

declare const Zotero: any

import debug = require('../lib/debug.ts')

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

function date2csl(date) {
  switch (date.type) {
    case 'open':
      return [0]

    case 'date':
      const csl = [date.year > 0 ? date.year : date.year - 1]
      if (date.month) {
        csl.push(date.month)
        if (date.day) {
          csl.push(date.day)
        }
      }
      return csl

    default:
      throw new Error(`Expected date or open, got ${date.type}`)
  }
}

function parseDate(date) {
  const parsed = Zotero.BetterBibTeX.parseDate(date)

  switch (parsed.type) {
    case 'date':
      return {
        'date-parts': [ date2csl(parsed) ],
        circa: parsed.approximate ? true : undefined,
      }

    case 'interval':
      return {
        'date-parts': [ date2csl(parsed.from), date2csl(parsed.to) ],
        circa: (parsed.from.approximate || parsed.to.approximate) ? true : undefined,
      }

    case 'verbatim':
      return { literal: parsed.verbatim }

    case 'season':
      return {
        'date-parts': [ [ parsed.year ] ],
        season: parsed.season,
        circa: parsed.approximate ? true : undefined,
      }

    default:
      throw new Error(`Unexpected date type ${JSON.stringify(parsed)}`)
  }
}

export = new class CSLExporter {
  public flush: Function // will be added by JSON/YAML exporter
  public serialize: Function // will be added by JSON/YAML exporter

  public doExport() {
    const items = []

    let item
    while (item = Zotero.nextItem()) {
      if (item.itemType === 'note' || item.itemType === 'attachment') continue

      let cached
      if (cached = Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options)) {
        items.push(cached.reference)
        continue
      }

      Zotero.BetterBibTeX.simplifyFields(item)
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
      if (item.__type__ === 'videoRecording' && csl.type === 'video') csl.type = 'motion_picture'

      if (csl.issued && item.date) csl.issued = parseDate(item.date)

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
            csl[name] = parseDate(value)
            break

          case 'creator':
            csl[name] = []
            for (let creator of value) {
              creator = {family: creator.name || creator.lastName || '', given: creator.firstName || '', isInstitution: (creator.name ? 1 : undefined)}
              Zotero.BetterBibTeX.parseParticles(creator)
              csl[name].push(creator)
            }
            break

          default:
            csl[name] = value
        }
      }

      [csl.shortTitle, csl['title-short']] = [csl['title-short'], csl.shortTitle]; // ; here for disambiguation
      [csl.journalAbbreviation, csl['container-title-short']] = [csl['container-title-short'], csl.journalAbbreviation]

      /* ham-fisted workaround for #365 */
      if (csl.type === 'motion_picture' || csl.type === 'broadcast') [csl.author, csl.director] = [csl.director, csl.author]

      csl.id = item.citekey

      /* Juris-M workarounds to match Zotero as close as possible */
      for (const kind of ['author', 'editor', 'director']) {
        for (const creator of csl[kind] || []) {
          delete creator.multi
        }
      }
      delete csl.multi
      delete csl.system_id

      let m
      if (csl.accessed && csl.accessed.raw && (m = csl.accessed.raw.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/))) {
        csl.accessed = { 'date-parts': [[ m[1], parseInt(m[2]), parseInt(m[3]) ]] } // tslint:disable-line:no-magic-numbers
      }
      if (csl.type === 'broadcast' && csl.genre === 'television broadcast') delete csl.genre

      csl = this.serialize(csl)

      Zotero.BetterBibTeX.cacheStore(item.itemID, Translator.options, csl)

      items.push(csl)
    }

    Zotero.write(this.flush(items))
  }
}
