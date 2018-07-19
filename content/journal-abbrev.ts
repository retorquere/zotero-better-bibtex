declare const Zotero: any

import { Preferences as Prefs } from './prefs'
import * as log from './debug'
import { Events } from './events'
import { ZoteroConfig } from './zotero-config'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let JournalAbbrev = new class { // tslint:disable-line:variable-name
  private initialized: boolean
  private style: any
  private abbrevs: any

  constructor() {
    this.initialized = false
  }

  public init() {
    if (this.initialized) return
    this.initialized = true

    Events.on('preference-changed', pref => {
      if (pref !== 'autoAbbrevStyle') return

      log.debug('JournalAbbrev.preference-changed:', {pref})
      this.reset()
    })

    this.reset()
    log.debug('JournalAbbrev.init: done')
  }

  public reset() {
    log.debug('JournalAbbrev.reset')

    this.style = Prefs.get('autoAbbrevStyle')
    if (ZoteroConfig.Zotero.isJurisM && !this.style) {
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

    log.debug('JournalAbbrev.reset:', {style: this.style})
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

    log.debug('JournalAbbrev.get: getting from', item.getField ? 'native' : 'serialised')

    for (const field of ['publicationTitle', 'reporter', 'code']) {
      try {
        log.debug('JournalAbbrev.get: trying', field)
        journal = item.getField ? item.getField(field, false, true) : item[field]
        if (!journal) continue
        journal = journal.replace(/<\/?(sup|sub|i|b)>/g, '')
        if (!journal) continue

        log.debug('JournalAbbrev.get: found', field, journal)
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

    log.debug('JournalAbbrev.get: generated', abbr)
    if (abbr === journal) return null
    return abbr || journal
  }
}
