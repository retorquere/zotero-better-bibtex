Zotero.BetterBibTeX.schomd = {}

Zotero.BetterBibTeX.schomd.init = ->
  Zotero.CiteProc.CSL.Output.Formats.markdown = {
    ### capture and remember the bare text for sane URL wrapping. ###
    _unescaped: null

    ###
    # text_escape: Format-specific function for escaping text destined
    # for output.  Takes the text to be escaped as sole argument.  Function
    # will be run only once across each portion of text to be escaped, it
    # need not be idempotent.
    ###
    text_escape: (text) ->
      text ||= ''
      Zotero.CiteProc.CSL.Output.Formats.markdown._unescaped = text

      return '' if text.match(/^https?:\/\/(dx.)?doi.org\/$/i)

      text = text.replace(/([-"\\`\*_{}\[\]\(\)#\+!])/g, "\\$1")
      text = text.replace(/(^|[\n])(\s*[0-9]+)\.(\s)/g, "$1\\.$2")
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
      Zotero.BetterBibTeX.debug('markdown.@cite/entry:', state.registry.registry[@system_id].ref.id)
      return str || ''

    '@bibliography/entry': (state, str) ->
      Zotero.BetterBibTeX.debug('markdown.@bibliography/entry:', state.registry.registry[@system_id].ref.id)
      try
        citekey = Zotero.BetterBibTeX.keymanager.get({itemID: state.registry.registry[@system_id].ref.id}).citekey
      catch
        citekey = '@@'
      return "<a name=\"@#{citekey}\"></a>#{str}\n\n"

    '@display/block': (state, str) -> "\n\n#{str}\n\n"

    '@display/left-margin': (state, str) -> str

    '@display/right-inline': (state, str) -> str

    '@display/indent': (state, str) -> "\n&nbsp;&nbsp;&nbsp;&nbsp;#{str}"

    '@showid/true': (state, str, cslid) -> str

    '@URL/true': (state, str) -> return "[#{str}](#{Zotero.CiteProc.CSL.Output.Formats.markdown._unescaped})"
    '@DOI/true': (state, str) ->
      url = Zotero.CiteProc.CSL.Output.Formats.markdown._unescaped
      url = 'https://doi.org/' + url unless url.match(/^https?:/)
      "[#{str}](#{url})"

    "@quotes/false": false
  }

Zotero.BetterBibTeX.schomd.itemIDs = (citekeys, {libraryID} = {}) ->
  libraryID ||= null
  citekeys = [citekeys] unless Array.isArray(citekeys)

  keys = (key for key in citekeys when typeof key != 'number')
  if keys.length == 0
    resolved = {}
  else
    resolved = Zotero.BetterBibTeX.keymanager.resolve(keys, {libraryID})

  return ((if typeof key == 'number' then key else resolved[key]?.itemID || null) for key in citekeys)

Zotero.BetterBibTeX.schomd.getStyle = (id = 'apa') ->
  style = Zotero.Styles.get("http://www.zotero.org/styles/#{id}")
  style ||= Zotero.Styles.get("http://juris-m.github.io/styles/#{id}")
  style ||= Zotero.Styles.get(id)
  return style

Zotero.BetterBibTeX.schomd.jsonrpc_citations = (citekeys, {format, style, libraryID} = {}) ->
  format ||= 'markdown'

  Zotero.BetterBibTeX.debug("schomd.citations:", {citekeys, format, style, libraryID})

  style = @getStyle(style)
  cp = style.getCiteProc()
  cp.opt.development_extensions.wrap_url_and_doi = true
  cp.setOutputFormat(format)

  clusters = []
  itemIDs = []
  for cluster in citekeys
    clusterIDs = (item for item in @itemIDs(cluster, {libraryID}) when item)

    ### the caller can't detect a key has not been resolved unless I refuse to resolve the whole cluster ###
    clusterIDs = [] unless clusterIDs.length == cluster.length

    itemIDs = itemIDs.concat(clusterIDs)
    clusters.push(({id:itemID} for itemID in clusterIDs))
  cp.updateItems(itemIDs)

  citations = []
  for cluster in clusters
    if cluster.length == 0
      # this null is intentional -- the input and output arrays must be the same length so the calling application can
      # tell which key cluster resolves to which label
      citations.push(null)
    else
      citations.push(cp.appendCitationCluster({citationItems: cluster, properties:{}}, true)[0][1] || null)

  throw new Error("schomd.citations: unsupported format #{format}") unless format == 'markdown'
  return citations

Zotero.BetterBibTeX.schomd.jsonrpc_citation = (citekeys, {format, style, libraryID} = {}) ->
  format ||= 'markdown'
  throw new Error("schomd.citation: unsupported format #{format}") unless format == 'markdown'

  itemIDs = (item for item in @itemIDs(citekeys, {libraryID}) when item)

  Zotero.BetterBibTeX.debug('schomd.citation', {citekeys, style, libraryID}, '->', itemIDs)

  return '' if itemIDs.length == 0

  style = @getStyle(style)
  cp = style.getCiteProc()
  cp.opt.development_extensions.wrap_url_and_doi = true
  cp.setOutputFormat(format)
  cp.updateItems(itemIDs)

  citation = cp.appendCitationCluster({citationItems: ({id:itemID} for itemID in itemIDs), properties:{}}, true)
  Zotero.BetterBibTeX.debug('schomd.citation:', citekeys, '->', JSON.stringify(citation))

  return citation[0][1]

Zotero.BetterBibTeX.schomd.jsonrpc_bibliography = (citekeys, {format, style, libraryID} = {}) ->
  format ||= 'markdown'
  itemIDs = @itemIDs(citekeys, {libraryID})
  return '' if itemIDs.length == 0

  # ditch unresolved citation keys
  itemIDs = (item for item in itemIDs when item)

  switch format
    when 'markdown'
      style = @getStyle(style)
      cp = style.getCiteProc()
      cp.opt.development_extensions.wrap_url_and_doi = true
      cp.setOutputFormat(format)
      cp.updateItems(itemIDs)
      bib = cp.makeBibliography()
      return '' unless bib
      return bib[0].bibstart + bib[1].join("") + bib[0].bibend

    when 'yaml'
      items = Zotero.Items.get(itemIDs)
      return Zotero.BetterBibTeX.Translators.translate(Zotero.BetterBibTeX.Translators.getID('Better CSL YAML'), {items}, {})

    else
      throw new Error("schomd.bibliography: unsupported format #{format}")

Zotero.BetterBibTeX.schomd.jsonrpc_search = (term) ->
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


Zotero.BetterBibTeX.schomd.jsonrpc_bibtex = (keys, {translator, libraryID, displayOptions} = {}) ->
  itemIDs = @itemIDs(keys, {libraryID})

  return '' if itemIDs.length == 0

  items = Zotero.Items.get(itemIDs)
  translator ||= 'betterbiblatex'
  displayOptions ||= {}

  return Zotero.BetterBibTeX.Translators.translate(Zotero.BetterBibTeX.Translators.getID(translator), {items}, displayOptions)
