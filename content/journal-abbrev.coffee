Prefs = require('./preferences.coffee')
debug = require('./debug.coffee')
events = require('./events.coffee')
zotero_config = require('./zotero-config.coffee')

class JournalAbbrev
  initialized: false

  init: ->
    return if @initialized

    events.on('preference-changed', (pref) =>
      return unless pref == 'autoAbbrevStyle'

      debug('JournalAbbrev.preference-changed:', {pref})
      @reset()
      return
    )

    @reset()
    debug('JournalAbbrev.init: done')

    @initialized = true
    return

  reset: ->
    debug('JournalAbbrev.reset')
    @style = Prefs.get('autoAbbrevStyle')
    @style ||= (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)[0].styleID if zotero_config.isJurisM

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
    debug('JournalAbbrev.reset:', {style: @style})
    return

  get: (serialized_item) ->
    return serialized_item.journalAbbreviation if serialized_item.journalAbbreviation
    return null unless serialized_item.itemType in ['conferencePaper', 'journalArticle', 'bill', 'case', 'statute']

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
