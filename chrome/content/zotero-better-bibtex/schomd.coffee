Zotero.BetterBibTeX.schomd = {}

Zotero.BetterBibTeX.schomd.init = ->
  Zotero.CiteProc.CSL.Output.Formats.markdown = {
    #
    # text_escape: Format-specific function for escaping text destined
    # for output.  Takes the text to be escaped as sole argument.  Function
    # will be run only once across each portion of text to be escaped, it
    # need not be idempotent.
    #
    text_escape: (text) ->
      text = text.replace(/([-"\\`\*_{}\[\]\(\)#\+!])/g, "\\$1")
      text = text.replace(/([0-9])\./g, "$1\\.")
      text = text.replace(Zotero.CiteProc.CSL.SUPERSCRIPTS_REGEXP, ((aChar) -> "<sup>#{Zotero.CiteProc.CSL.SUPERSCRIPTS[aChar]}</sup>"))
      return text

    bibstart: ''
    bibend: ''
    '@font-style/italic': '_%%STRING%%_'
    '@font-style/oblique':'_%%STRING%%_'
    '@font-style/normal': false
    '@font-variant/small-caps': '<span style="font-variant:small-caps;">%%STRING%%</span>'
    '@passthrough/true': Zotero.CiteProc.CSL.Output.Formatters.passthrough
    '@font-variant/normal': false
    '@font-weight/bold': '**%%STRING%%**'
    '@font-weight/normal': false
    '@font-weight/light': false
    '@text-decoration/none': false
    '@text-decoration/underline': false
    '@vertical-align/sup': '<sup>%%STRING%%</sup>'
    '@vertical-align/sub': '<sub>%%STRING%%</sub>'
    '@vertical-align/baseline': false
    '@strip-periods/true': Zotero.CiteProc.CSL.Output.Formatters.passthrough
    '@strip-periods/false': Zotero.CiteProc.CSL.Output.Formatters.passthrough
    '@quotes/true': (state, str) ->
      return state.getTerm('open-quote')  unless str?
      return state.getTerm('open-quote') + str + state.getTerm('close-quote')

    '@quotes/inner': (state, str) ->
      return '’'  unless str?
      return state.getTerm('open-inner-quote') + str + state.getTerm('close-inner-quote')

    '@quotes/false': false

    '@cite/entry': (state, str) ->
      citekey = Zotero.DB.valueQuery('select citekey from betterbibtex.keys where itemID = ?', [state.registry.registry[@system_id].ref.id])
      return "[#{str}][@#{citekey}]"

    '@bibliography/entry': (state, str) ->
      citekey = Zotero.DB.valueQuery('select citekey from betterbibtex.keys where itemID = ?', [state.registry.registry[@system_id].ref.id])
      return "[@#{citekey}]: ##{citekey} \"#{str.replace(/\\/g, '').replace(/"/g, "'")}\"\n<a name=\"#{citekey}\"></a>#{str}\n"

    '@display/block': (state, str) -> "\n\n#{str}\n\n"

    '@display/left-margin': (state, str) -> str

    '@display/right-inline': (state, str) -> str

    '@display/indent': (state, str) -> "\n&nbsp;&nbsp;&nbsp;&nbsp;#{str}"

    '@showid/true': (state, str, cslid) -> str

    '@URL/true': (state, str) -> "[#{str}](#{str})"
    '@DOI/true': (state, str) -> "[#{str}](http://dx.doi.org/#{str})"

    "@quotes/false": false
  }
  return

Zotero.BetterBibTeX.schomd.items = (citekeys, {library} = {}) ->
  citekeys = [citekeys] unless Array.isArray(citekeys)

  ids = []
  keys = []
  for key in citekeys
    if typeof key == 'number'
      ids.push(key)
    else
      keys.push(key)
  return ids if keys.length == 0

  sql = "select itemID from betterbibtex.keys
         where citekey in (#{('?' for citekey in keys).join(',')})
           and itemID in (select itemID from items where coalesce(libraryID, 0) = ?)"
  keys.push(library || 0)
  found = Zotero.DB.columnQuery(sql, keys)
  return ids unless keys
  return ids.concat(found)

Zotero.BetterBibTeX.schomd.citation = (citekeys, {style, library} = {}) ->
  items = @items(citekeys, {library: library})

  return '' if items.length == 0

  url = "http://www.zotero.org/styles/#{style ? 'apa'}"
  style = Zotero.Styles.get(url)
  cp = style.getCiteProc()
  cp.setOutputFormat('markdown')
  cp.updateItems(items)
  return (cp.appendCitationCluster({citationItems: [{id:item}], properties:{}}, true)[0][1] for item in items)

Zotero.BetterBibTeX.schomd.bibliography = (citekeys, {style, library} = {}) ->
  items = @items(citekeys, {library: library})
  return '' if items.length == 0

  url = "http://www.zotero.org/styles/#{stylename ? 'apa'}"
  style = Zotero.Styles.get(url)
  cp = style.getCiteProc()
  cp.setOutputFormat('markdown')
  cp.updateItems(items)
  bib = cp.makeBibliography()

  return '' unless bib
  return bib[0].bibstart + bib[1].join("") + bib[0].bibend

Zotero.BetterBibTeX.schomd.search = (term) ->
  search = new Zotero.Search()
  search.addCondition('quicksearch-titleCreatorYear', 'contains', term, false)
  results = search.search()

  return [] if not results

  return (
    {
      id: item.id
      key: item.key
      libraryID: item.libraryID
      libraryKey: item.libraryKey
      title: item.getField('title')
      date: item.getField('date')
      extra: item.getField('extra')
      creators: (
        {lastName: creator.ref.lastName, firstName: creator.ref.firstName} for creator in item.getCreators()
      )
    } for item in Zotero.Items.get(results))

Zotero.BetterBibTeX.schomd.bibtex = (keys, {translator, format, library, displayOptions} = {}) ->
  items = @items(keys, {library: library})
  #Zotero.Items.get doesn't like being passed an empty array
  items = Zotero.Items.get(items) if items.length > 0
  translator ||= 'betterbiblatex'
  format ||= 'json'
  displayOptions ||= {}

  if format == 'json'
    return (
      {
        id: item.id
        library: item.libraryID
        key: item.key
        bibtex: Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {items: [item]}, displayOptions)
      } for item in items
    )


  # translate doesn't like being passed an empty set of items
  return Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {items: items}, displayOptions) if items.length != 0

  return []
