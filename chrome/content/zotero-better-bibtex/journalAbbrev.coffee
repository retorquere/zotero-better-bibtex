Zotero.BetterBibTeX.JournalAbbrev = new class
  constructor: ->
    @reset()

  reset: ->
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

  get: (item) ->
    return item.journalAbbreviation if item.journalAbbreviation
    return null unless item.itemType in ['conferencePaper', 'journalArticle', 'bill', 'case', 'statute']

    # don't even try to auto-abbrev arxiv IDs
    return null if item.arXiv?.source == 'publicationTitle'

    key = item.publicationTitle || item.reporter || item.code
    return unless key
    return unless Zotero.BetterBibTeX.Pref.get('autoAbbrev')

    style = Zotero.BetterBibTeX.Pref.get('autoAbbrevStyle') || (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)[0].styleID

    @abbrevs['default']?['container-title']?[key] || Zotero.Cite.getAbbreviation(style, @abbrevs, 'default', 'container-title', key)
    return @abbrevs['default']?['container-title']?[key] || key
