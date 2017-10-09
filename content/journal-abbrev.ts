declare const Zotero: any

const prefs = require('./prefs.ts')
const debug = require('./debug.ts')
const events = require('./events.ts')
const zoteroCconfig = require('./zotero-config.ts')

class JournalAbbrev {
  private initialized: boolean
  private style: any
  private abbrevs: any

  constructor() {
    this.initialized = false
  }

  public init() {
    if (this.initialized) return
    this.initialized = true

    events.on('preference-changed', pref => {
      if (pref !== 'autoAbbrevStyle') return

      debug('JournalAbbrev.preference-changed:', {pref})
      this.reset()
    })

    this.reset()
    debug('JournalAbbrev.init: done')
  }

  public reset() {
    debug('JournalAbbrev.reset')

    this.style = prefs.get('autoAbbrevStyle')
    if (zoteroCconfig.isJurisM && !this.style) {
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

    debug('JournalAbbrev.reset:', {style: this.style})
  }

  public get(item, force) {
    let abbrev, journal

    if (item.getField) {
      try {
        abbrev = item.getField('journalAbbreviation', false, true)
      } catch (error) {}
    } else {
      abbrev = item.journalAbbreviation
    }

    if (abbrev || (!prefs.get('autoAbbrev') && !force)) return abbrev

    if (!['conferencePaper', 'journalArticle', 'bill', 'case', 'statute'].includes(item.getField ? Zotero.ItemTypes.getName(item.itemTypeID) : item.itemType)) return null

    debug('JournalAbbrev.get: getting from', item.getField ? 'native' : 'serialised')

    for (const field of ['publicationTitle', 'reporter', 'code']) {
      try {
        debug('JournalAbbrev.get: trying', field)
        journal = item.getField ? item.getField(field, false, true) : item[field]
        if (!journal) continue
        journal = journal.replace(/<\/?(sup|sub|i|b)>/g, '')
        if (!journal) continue

        debug('JournalAbbrev.get: found', field, journal)
        break
      } catch (err) {
        debug('JournalAbbrev.get: err', err)
      }
    }

    if (!journal) return null

    // don't even try to auto-abbrev arxiv IDs.
    /* TODO: How did the arXiv id's get into the serialized object? */
    // return null if serialized_item.arXiv?.source == 'publicationTitle'

    if (!this.abbrevs.default['container-title'][journal]) {
      Zotero.Cite.getAbbreviation(this.style, this.abbrevs, 'default', 'container-title', journal)
    }
    const abbr = this.abbrevs.default['container-title'][journal]

    debug('JournalAbbrev.get: generated', abbr)
    if (abbr === journal) return null
    return abbr || journal
  }
}

export = new JournalAbbrev()
