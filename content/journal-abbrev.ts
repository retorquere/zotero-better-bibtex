import { Preference } from '../gen/preferences'
import { Events } from './events'
import { client } from './client'

import { log } from './logger'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const JournalAbbrev = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private initialized: boolean
  private style: any
  private abbrevs: any

  constructor() {
    this.initialized = false
  }

  public async init() {
    if (this.initialized) return null
    await Zotero.Styles.init() // otherwise Juris-M throws 'Styles not yet loaded'
    this.initialized = true

    Events.on('preference-changed', pref => {
      if (pref !== 'autoAbbrevStyle') return null

      this.reset()
    })

    this.reset()
  }

  public reset() {
    this.style = Preference.autoAbbrevStyle
    if (client === 'jurism' && !this.style) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      this.style = Zotero.Styles.getVisible().filter(style => style.usesAbbreviation)[0].styleID
    }

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

  public get(item, force = false): string {
    let abbrev:string
    let journal: string
    const zotero_item = !!(item.setType)

    if (zotero_item) {
      try {
        abbrev = item.getField('journalAbbreviation', false, true)
      }
      catch (error) {}
    }
    else {
      abbrev = item.journalAbbreviation
    }

    if (abbrev || (!Preference.autoAbbrev && !force)) return abbrev

    if (!['conferencePaper', 'journalArticle', 'bill', 'case', 'statute'].includes(zotero_item ? Zotero.ItemTypes.getName(item.itemTypeID) : item.itemType)) return null

    for (const field of ['publicationTitle', 'reporter', 'code']) {
      try {
        journal = zotero_item ? item.getField(field, false, true) : item[field]
        if (!journal) continue
        journal = journal.replace(/<\/?(sup|sub|i|b)>/g, '')
        if (!journal) continue

        break
      }
      catch (err) {
        log.error('JournalAbbrev.get: err', err)
      }
    }

    if (!journal) return null

    // juris-m doesn't offer the abbreviator anymore. https://github.com/Juris-M/zotero/issues/47
    if (!this.abbrevs.default['container-title'][journal] && typeof Zotero.Cite.getAbbreviation === 'function') {
      Zotero.Cite.getAbbreviation(this.style, this.abbrevs, 'default', 'container-title', journal)
    }
    const abbr: string = this.abbrevs.default['container-title'][journal]

    if (abbr === journal) return null
    return abbr || journal
  }
}
