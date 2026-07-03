import * as client from './client'
import { orchestrator } from './orchestrator'
import { log } from './logger'

import { simplifyForExport } from './item-schema'

export const JournalAbbrev = new class {
  private style: any
  private abbrevs: any
  private journal = new Set(['conferencePaper', 'journalArticle', 'bill', 'case', 'statute'])
  private fields = ['publicationTitle', 'reporter', 'code']

  constructor() {
    orchestrator.add({
      id: 'abbreviator',
      description: 'journal abbreviator',
      needs: ['start'],
      startup: async () => {
        if (client.slug === 'jurism') await Zotero.Styles.init() // otherwise Juris-M throws 'Styles not yet loaded'
        this.reset()

        /*
        Events.on('preference-changed', pref => {
          if (pref === 'autoAbbrevStyle') this.reset()
        })
        */
      },
    })
  }

  public reset() {
    /*
    this.style = Preference.autoAbbrevStyle
    if (client.slug === 'jurism' && !this.style) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      this.style = Zotero.Styles.getVisible().filter(style => style.usesAbbreviation)[0].styleID
    }
    */

    this.abbrevs = {
      default: {
        'container-title': { },
        'collection-title': { },
        'institution-entire': { },
        'institution-part': { },
        nickname: { },
        // eslint-disable-next-line id-blacklist
        number: { },
        title: { },
        place: { },
        hereinafter: { },
        classic: { },
        'container-phrase': { },
        'title-phrase': { },
      },
    }
  }

  getField(item, field, native): string {
    try {
      return (native ? item.getField(field, false, true) as string : item[field] as string) || null
    }
    catch {
      return null
    }
  }

  public get(item, mode: 'abbrev' | 'auto' | 'abbrev+auto' = 'abbrev+auto'): string {
    const zotero_item = !!(item._objectType) // eslint-disable-line no-underscore-dangle
    if (!zotero_item) item = simplifyForExport(Object.create(item), { creators: false, scrub: false }) // don't mess with the serialized object, Zotero needs it intact

    const itemType = zotero_item ? Zotero.ItemTypes.getName(item.itemTypeID) : item.itemType
    const itemKey = item.itemKey || item.key || null

    let abbrev = mode.startsWith('abbrev') ? this.getField(item, 'journalAbbreviation', zotero_item) : null
    if (abbrev || !mode.endsWith('auto')) {
      log.info('journal-abbrev.get:', {
        mode,
        itemKey,
        itemType,
        publicationTitle: this.getField(item, 'publicationTitle', zotero_item),
        journalAbbreviation: this.getField(item, 'journalAbbreviation', zotero_item),
        autoJournalAbbreviation: null,
        selected: abbrev,
        reason: abbrev ? 'explicit-journalAbbreviation' : 'auto-disabled',
      })
      return abbrev
    }

    if (!this.journal.has(itemType)) {
      log.info('journal-abbrev.get:', {
        mode,
        itemKey,
        itemType,
        publicationTitle: this.getField(item, 'publicationTitle', zotero_item),
        journalAbbreviation: this.getField(item, 'journalAbbreviation', zotero_item),
        autoJournalAbbreviation: null,
        selected: null,
        reason: 'item-type-not-abbreviated',
      })
      return null
    }

    const journal: string = this.fields.map(field => this.getField(item, field, zotero_item)?.replace(/<\/?(sup|sub|i|b)>/g, '')).find(_ => _)
    if (!journal) {
      log.info('journal-abbrev.get:', {
        mode,
        itemKey,
        itemType,
        publicationTitle: this.getField(item, 'publicationTitle', zotero_item),
        journalAbbreviation: this.getField(item, 'journalAbbreviation', zotero_item),
        autoJournalAbbreviation: null,
        selected: null,
        reason: 'no-journal-source-field',
      })
      return null
    }

    // juris-m doesn't offer the abbreviator anymore. https://github.com/Juris-M/zotero/issues/47
    if (!this.abbrevs.default['container-title'][journal] && typeof Zotero.Cite.getAbbreviation === 'function') {
      Zotero.Cite.getAbbreviation(this.style, this.abbrevs, 'default', 'container-title', journal)
    }
    abbrev = this.abbrevs.default['container-title'][journal]
    if (abbrev && abbrev.toLowerCase() !== journal.toLowerCase().replace(/[.]/g, '')) {
      log.info('journal-abbrev.get:', {
        mode,
        itemKey,
        itemType,
        journal,
        publicationTitle: this.getField(item, 'publicationTitle', zotero_item),
        journalAbbreviation: this.getField(item, 'journalAbbreviation', zotero_item),
        autoJournalAbbreviation: abbrev,
        selected: abbrev,
        reason: 'auto-abbrev',
      })
      return abbrev
    }

    log.info('journal-abbrev.get:', {
      mode,
      itemKey,
      itemType,
      journal,
      publicationTitle: this.getField(item, 'publicationTitle', zotero_item),
      journalAbbreviation: this.getField(item, 'journalAbbreviation', zotero_item),
      autoJournalAbbreviation: abbrev || null,
      selected: null,
      reason: 'auto-missing-or-equal-to-full-title',
    })

    return null
  }
}
