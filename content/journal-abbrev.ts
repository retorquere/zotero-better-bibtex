declare const Zotero: any

import { Preferences as Prefs } from './prefs'
import { Events } from './events'
import { client } from './client'

import { log } from './logger'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let JournalAbbrev = new class { // tslint:disable-line:variable-name
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
    this.style = Prefs.get('autoAbbrevStyle')
    if (client === 'jurism' && !this.style) {
      this.style = Zotero.Styles.getVisible().filter(style => style.usesAbbreviation)[0].styleID
    }

    this.abbrevs = {
      default: {
        'container-title': { },
        'collection-title': { },
        'institution-entire': { },
        'institution-part': { },
        nickname: { },
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

  public get(item, force = false) {
    let abbrev, journal

    if (item.getField) {
      try {
        abbrev = item.getField('journalAbbreviation', false, true)
      } catch (error) {}
    } else {
      abbrev = item.journalAbbreviation
    }

    if (abbrev || (!Prefs.get('autoAbbrev') && !force)) return abbrev

    if (!['conferencePaper', 'journalArticle', 'bill', 'case', 'statute'].includes(item.getField ? Zotero.ItemTypes.getName(item.itemTypeID) : item.itemType)) return null

    for (const field of ['publicationTitle', 'reporter', 'code']) {
      try {
        journal = item.getField ? item.getField(field, false, true) : item[field]
        if (!journal) continue
        journal = journal.replace(/<\/?(sup|sub|i|b)>/g, '')
        if (!journal) continue

        break
      } catch (err) {
        log.error('JournalAbbrev.get: err', err)
      }
    }

    if (!journal) return null

    // juris-m doesn't offer the abbreviator anymore. https://github.com/Juris-M/zotero/issues/47
    if (!this.abbrevs.default['container-title'][journal] && typeof Zotero.Cite.getAbbreviation === 'function') {
      Zotero.Cite.getAbbreviation(this.style, this.abbrevs, 'default', 'container-title', journal)
    }
    const abbr = this.abbrevs.default['container-title'][journal]

    if (abbr === journal) return null
    return abbr || journal
  }
}
