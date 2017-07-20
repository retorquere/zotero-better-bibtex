Prefs = require('./preferences.coffee')

class JournalAbbrev
  constructor: ->
    Prefs.observe((subject, topic, data) =>
      @reset() if data.endsWith('.autoAbbrev') || data.endsWith('.autoAbbrevStyle')
      return
    )
    @reset()

  reset: ->
    @abbrev = Prefs.get('autoAbbrev')
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
    return

  get: (serialized_item) ->
    return serialized_item.journalAbbreviation if serialized_item.journalAbbreviation
    return null unless serialized_item.itemType in ['conferencePaper', 'journalArticle', 'bill', 'case', 'statute']

    # don't even try to auto-abbrev arxiv IDs.
    ### TODO: How did the arXiv id's get into the serialized object? ###
    return null if serialized_item.arXiv?.source == 'publicationTitle'

    key = serialized_item.publicationTitle || serialized_item.reporter || serialized_item.code
    return unless key
    return unless @abbrev

    @abbrevs['default']?['container-title']?[key] || Zotero.Cite.getAbbreviation(@style, @abbrevs, 'default', 'container-title', key)
    return @abbrevs['default']?['container-title']?[key] || key
