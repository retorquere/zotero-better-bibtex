import { ITranslator } from '../../gen/translator'
declare const Translator: ITranslator

declare const Zotero: any

import { debug } from '../lib/debug.ts'

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

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let CSLExporter = new class {
  public flush: Function // will be added by JSON/YAML exporter
  public serialize: Function // will be added by JSON/YAML exporter
  public parseDate: Function // will be added by JSON/YAML exporter

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

      if (item.date) csl.issued = this.parseDate(item.date)
      if (item.accessDate) csl.accessed = this.parseDate(item.accessDate)

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
            csl[name] = this.parseDate(value)
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

      if (csl.type === 'broadcast' && csl.genre === 'television broadcast') delete csl.genre

      csl = this.serialize(csl)

      Zotero.BetterBibTeX.cacheStore(item.itemID, Translator.options, csl)

      items.push(csl)
    }

    Zotero.write(this.flush(items))
  }
}
