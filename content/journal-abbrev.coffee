Prefs = require('./preferences.coffee')
debug = require('./debug.coffee')
events = require('./events.coffee')

class JournalAbbrev
  init: ->
    events.on('preference-changed', (pref) =>
      return unless pref in ['autoAbbrev', 'autoAbbrevStyle']

      debug('JournalAbbrev.preference-changed:', {pref})
      @reset()
      return
    )

    @reset()
    debug('JournalAbbrev.init: done')
    return

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
    return serialized_item.journalAbbreviation if serialized_item.journalAbbreviation
    return null unless serialized_item.itemType in ['conferencePaper', 'journalArticle', 'bill', 'case', 'statute']
    return null unless @active

    journal = serialized_item.publicationTitle || serialized_item.reporter || serialized_item.code
    return null unless journal

    # don't even try to auto-abbrev arxiv IDs.
    ### TODO: How did the arXiv id's get into the serialized object? ###
    return null if serialized_item.arXiv?.source == 'publicationTitle'

    @abbrevs['default']?['container-title']?[journal] || Zotero.Cite.getAbbreviation(@style, @abbrevs, 'default', 'container-title', journal)

    abbr = @abbrevs['default']?['container-title']?[journal]
    return null if abbr == journal
    return abbr || journal

module.exports = new JournalAbbrev()
