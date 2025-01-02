import * as client from './client'
import { orchestrator } from './orchestrator'

import { simplifyForExport as simplify } from '../gen/items/simplify'

export const JournalAbbrev = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
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
    if (!zotero_item) item = simplify(Object.create(item), { creators: false, scrub: false }) // don't mess with the serialized object, Zotero needs it intact

    let abbrev = mode.startsWith('abbrev') ? this.getField(item, 'journalAbbreviation', zotero_item) : null
    if (abbrev || !mode.endsWith('auto')) return abbrev

    if (!this.journal.has(zotero_item ? Zotero.ItemTypes.getName(item.itemTypeID) : item.itemType)) return null

    const journal: string = this.fields.map(field => this.getField(item, field, zotero_item)?.replace(/<\/?(sup|sub|i|b)>/g, '')).find(_ => _)
    if (!journal) return null

    // juris-m doesn't offer the abbreviator anymore. https://github.com/Juris-M/zotero/issues/47
    if (!this.abbrevs.default['container-title'][journal] && typeof Zotero.Cite.getAbbreviation === 'function') {
      Zotero.Cite.getAbbreviation(this.style, this.abbrevs, 'default', 'container-title', journal)
    }
    abbrev = this.abbrevs.default['container-title'][journal]
    if (abbrev && abbrev.toLowerCase() !== journal.toLowerCase().replace(/[.]/g, '')) return abbrev

    return null
  }
}
