Prefs = require('./preferences.coffee')
debug = require('./debug.coffee')
events = require('./events.coffee')

class JournalAbbrev
  init: Zotero.Promise.coroutine(->
    debug('JournalAbbrev.init: waiting for styles...')
    yield Zotero.Styles.init()

    Prefs.onChange((pref) =>
      return unless pref in ['autoAbbrev', 'autoAbbrevStyle']

      debug('JournalAbbrev.preference-changed:', {pref})
      @reset()
      return
    )

    @reset()
    debug('JournalAbbrev.init: done')

    return
  )

  reset: ->
    debug('JournalAbbrev.reset')
    @active = Prefs.get('autoAbbrev')
    @style = Prefs.get('autoAbbrevStyle') || (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)[0].styleID

    @abbrevs = {
      default: {
        "container-title": { },
        "collection-title": { },
        "institution-entire": { },
        "institution-part": { },
        "nickname": { },
        "number": { },
        "title": { },
        "place": { },
        "hereinafter": { },
        "classic": { },
        "container-phrase": { },
        "title-phrase": { }
      }
    }
    debug('JournalAbbrev.reset:', {active: @active, style: @style})
    return

  get: (serialized_item) ->
    debug('JournalAbbrev.get', {source: serialized_item.publicationTitle || serialized_item.reporter || serialized_item.code, active: @active, arxive: serialized_item.arXiv?.source == 'publicationTitle'})
    return serialized_item.journalAbbreviation if serialized_item.journalAbbreviation
    return null unless serialized_item.itemType in ['conferencePaper', 'journalArticle', 'bill', 'case', 'statute']

    debug('JournalAbbrev.get: arxiv?')
    # don't even try to auto-abbrev arxiv IDs.
    ### TODO: How did the arXiv id's get into the serialized object? ###
    return null if serialized_item.arXiv?.source == 'publicationTitle'

    return unless @active

    key = serialized_item.publicationTitle || serialized_item.reporter || serialized_item.code
    return unless key

    @abbrevs['default']?['container-title']?[key] || Zotero.Cite.getAbbreviation(@style, @abbrevs, 'default', 'container-title', key)
    debug('JournalAbbrev.get=', key, @abbrevs['default']?['container-title']?[key])
    return @abbrevs['default']?['container-title']?[key] || key

module.exports = new JournalAbbrev()
