Zotero.BetterBibTeX.schomd = {}

Zotero.BetterBibTeX.schomd.init = ->
  Zotero.CiteProc.CSL.Output.Formats.markdown = {
    ###
    # text_escape: Format-specific function for escaping text destined
    # for output.  Takes the text to be escaped as sole argument.  Function
    # will be run only once across each portion of text to be escaped, it
    # need not be idempotent.
    ###
    text_escape: (text) ->
      text = '' unless text?
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

  Zotero.CiteProc.CSL.Output.Formats.bbl = {
    ###
    # text_escape: Format-specific function for escaping text destined
    # for output.  Takes the text to be escaped as sole argument.  Function
    # will be run only once across each portion of text to be escaped, it
    # need not be idempotent.
    ###
    # 29\raise0.5ex\hbox{th}
    # \usepackage{xltxtra}, \textsuperscript{} \textsubscript{}
    text_escape: (text) ->
      text = '' unless text?
      text = text.replace(/(\. )/g, ".\\ ")
      text = text.replace(Zotero.CiteProc.CSL.SUPERSCRIPTS_REGEXP, ((aChar) -> "{\\textsuperscript{#{Zotero.CiteProc.CSL.SUPERSCRIPTS[aChar]}}}"))
      return text
    # Todo: how to compute the width? I'm arbitrarily setting it to 4
    # digits for now.
    bibstart: '\\begin{thebibliography}{9999}\n\n'
    bibend: '\\end{thebibliography}\n'
    '@font-style/italic': '\\textit{%%STRING%%}'
    '@font-style/oblique':'\\textsl{%%STRING%%}'
    '@font-style/normal': false
    '@font-variant/small-caps': '\\textsc{%%STRING%%}'
    '@passthrough/true': Zotero.CiteProc.CSL.Output.Formatters.passthrough
    '@font-variant/normal': false
    '@font-weight/bold': '\\textbf{%%STRING%%}'
    '@font-weight/normal': false
    '@font-weight/light': false
    '@text-decoration/none': false
    '@text-decoration/underline': false
    '@vertical-align/sup': '\\textsuperscript{%%STRING%%}'
    '@vertical-align/sub': '\\textsubscript{%%STRING%%}'
    '@vertical-align/baseline': false
    '@strip-periods/true': Zotero.CiteProc.CSL.Output.Formatters.passthrough
    '@strip-periods/false': Zotero.CiteProc.CSL.Output.Formatters.passthrough
    '@quotes/true': (state, str) ->
      return '``' unless str?
      return '``' + str + '\'\''

    '@quotes/inner': (state, str) ->
      return '’'  unless str?
      return state.getTerm('open-inner-quote') + str + state.getTerm('close-inner-quote')

    '@quotes/false': false

    '@cite/entry': (state, str) ->
      Zotero.BetterBibTeX.debug('bbl.@cite/entry:', state.registry.registry[@system_id].ref.id)
      return str || ''

    '@bibliography/entry': (state, str) ->
      Zotero.BetterBibTeX.debug('bbl.@bibliography/entry:', state.registry.registry[@system_id].ref.id)
      try
        citekey = Zotero.BetterBibTeX.keymanager.get({itemID: state.registry.registry[@system_id].ref.id}).citekey
      catch
        citekey = '@@'
      return "\\bibitem{#{citekey}}\n#{str}\n\n"

    '@display/block': (state, str) -> "\n\\newblock #{str}\n"

    '@display/left-margin': (state, str) -> str

    '@display/right-inline': (state, str) -> str

    '@display/indent': (state, str) -> "\n\\quad #{str}"

    '@showid/true': (state, str, cslid) -> "((showid:#{str}))"

    # May be TeXmacs specific, but can define macros.
    '@URL/true': (state, str) -> "\\href{#{str}}"
    '@DOI/true': (state, str) -> "\\hlink{#{str}}{http://dx.doi.org/#{str}}"

    "@quotes/false": false
  }
  return

Zotero.BetterBibTeX.schomd.itemIDs = (citekeys, {libraryID} = {}) ->
  libraryID ||= null
  citekeys = [citekeys] unless Array.isArray(citekeys)

  keys = (key for key in citekeys when typeof key != 'number')
  if keys.length == 0
    resolved = {}
  else
    resolved = Zotero.BetterBibTeX.keymanager.resolve(keys, {libraryID})

  return ((if typeof key == 'number' then key else resolved[key]?.itemID || null) for key in citekeys)

Zotero.BetterBibTeX.schomd.citations = (citekeys, {style, libraryID} = {}) ->
  url = "http://www.zotero.org/styles/#{style ? 'apa'}"
  style = Zotero.Styles.get(url)
  cp = style.getCiteProc()
  cp.setOutputFormat('markdown')

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
      citations.push(null)
    else
      citations.push(cp.appendCitationCluster({citationItems: cluster, properties:{}}, true)[0][1] || null)

  return citations

Zotero.BetterBibTeX.schomd.getStyle = (id = 'apa') ->
  style = Zotero.Styles.get("http://www.zotero.org/styles/#{id}")
  style ||= Zotero.Styles.get("http://juris-m.github.io/styles/#{id}")
  style ||= Zotero.Styles.get(id)
  return style

Zotero.BetterBibTeX.schomd.citation = (citekeys, {style, libraryID} = {}) ->
  itemIDs = (item for item in @itemIDs(citekeys, {libraryID}) when item)

  Zotero.BetterBibTeX.debug('schomd.citation', {citekeys, style, libraryID}, '->', itemIDs)

  return '' if itemIDs.length == 0

  style = @getStyle(style)
  cp = style.getCiteProc()
  cp.setOutputFormat('markdown')
  cp.updateItems(itemIDs)

  citation = cp.appendCitationCluster({citationItems: ({id:itemID} for itemID in itemIDs), properties:{}}, true)
  Zotero.BetterBibTeX.debug('schomd.citation:', citekeys, '->', JSON.stringify(citation))
  citation = citation[0][1]
  return citation

Zotero.BetterBibTeX.schomd.bibliography = (citekeys, {style, libraryID} = {}) ->
  itemIDs = @itemIDs(citekeys, {libraryID})
  return '' if itemIDs.length == 0

  style = @getStyle(style)
  cp = style.getCiteProc()
  cp.setOutputFormat('markdown')
  cp.updateItems((item for item in itemIDs when item))
  bib = cp.makeBibliography()

  return '' unless bib
  return bib[0].bibstart + bib[1].join("") + bib[0].bibend

Zotero.BetterBibTeX.schomd.bibliographyhtml = (citekeys, {style, libraryID} = {}) ->
  itemIDs = @itemIDs(citekeys, {libraryID})
  return '' if itemIDs.length == 0

  style = @getStyle(style)
  cp = style.getCiteProc()
  cp.setOutputFormat('html')
  cp.updateItems((item for item in itemIDs when item))
  bib = cp.makeBibliography()

  return '' unless bib
  return bib[0].bibstart + bib[1].join("") + bib[0].bibend

Zotero.BetterBibTeX.schomd.bibliographybbl = (citekeys, {style, libraryID} = {}) ->
  itemIDs = @itemIDs(citekeys, {libraryID})
  return '' if itemIDs.length == 0

  style = @getStyle(style)
  cp = style.getCiteProc()
  cp.setOutputFormat('bbl')
  cp.updateItems((item for item in itemIDs when item))
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

Zotero.BetterBibTeX.schomd.bibtex = (keys, {translator, libraryID, displayOptions} = {}) ->
  itemIDs = @itemIDs(keys, {libraryID})

  return '' if items.length == 0

  items = Zotero.Items.get(items)
  translator ||= 'betterbiblatex'
  displayOptions ||= {}

  deferred = Q.defer()
  Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {items}, displayOptions, (err, result) ->
    if err
      deferred.reject(err)
    else
      deferred.fulfill(result)
  )
  return deferred.promise
