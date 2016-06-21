Zotero.BetterBibTeX.schomd = {}

Zotero.BetterBibTeX.schomd.markdown_text_escape = (text) ->
  text = text.replace(/([-"\\`\*_{}\[\]\(\)#\+!])/g, "\\$1")
  text = text.replace(/(^|[\n])(\s*[0-9]+)\.(\s)/g, "$1\\.$2")
  text = text.replace(Zotero.CiteProc.CSL.SUPERSCRIPTS_REGEXP, ((aChar) -> "<sup>#{Zotero.CiteProc.CSL.SUPERSCRIPTS[aChar]}</sup>"))
  return text

Zotero.BetterBibTeX.schomd.init = ->
  Zotero.CiteProc.CSL.Output.Formats.markdown = {
    ###
    # text_escape: Format-specific function for escaping text destined
    # for output.  Takes the text to be escaped as sole argument.  Function
    # will be run only once across each portion of text to be escaped, it
    # need not be idempotent.
    ###
    text_escape: (text, force) ->
      return '' unless text?

      if text.match(/(https?:\/\/[^\s]+)/)
        return '[' + Zotero.BetterBibTeX.schomd.markdown_text_escape(text) + '](' + text + ')'
      else
        return Zotero.BetterBibTeX.schomd.markdown_text_escape(text)

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
      return "<a name=\"@#{citekey}\"/>#{str}\n"

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
    # \usepackage{xltxtra}, \textsuperscript{} \textsubscript{}
    #
    text_escape: (text) ->
      text = '' unless text?
      #savetext = text
      text = text.replace(/([$_^{%&])(?!!)/g, "\\$1")
        .replace(/([$_^{%&])!/g, "$1")
        .replace(/\u00A0/g, "\\hspace{1spc}")
        .replace(Zotero.CiteProc.CSL.SUPERSCRIPTS_REGEXP,
          ((aChar) -> "{\\textsuperscript{#{Zotero.CiteProc.CSL.SUPERSCRIPTS[aChar]}}}"))
      # Wrap URL's anyway?
      #if ! state.development_extensions.wrap_url_and_doi
      #  # but not twice when that option is on.
      #  if savetext.search('^(?:http|ftp)s?://') != -1
      #  return '\\ztHref{' + savetext + "}{" + savetext + '}'
      return text

    # Width is set by computation using maxoffset after the bibliography is generated.
    bibstart: '\\begin{thebibliography}{9999}\n\n'
    bibend: '\\end{thebibliography}\n'
    '@font-style/italic': '\\textit{%%STRING%%}'
    '@font-style/oblique': '\\textsl{%%STRING%%}'
    '@font-style/normal': '{\\upshape %%STRING%%}'
    '@font-variant/small-caps': '\\textsc{%%STRING%%}'
    '@passthrough/true': Zotero.CiteProc.CSL.Output.Formatters.passthrough
    '@font-variant/normal': '{\\upshape \\mdseries %%STRING%%}'
    '@font-weight/bold': '\\textbf{%%STRING%%}'
    '@font-weight/normal': '{\\mdseries %%STRING%%}'
    '@font-weight/light': false
    '@text-decoration/none': false
    '@text-decoration/underline': '\\underline{%%STRING%%}'
    '@vertical-align/sup': '\\textsuperscript{%%STRING%%}'
    '@vertical-align/sub': '\\textsubscript{%%STRING%%}'
    '@vertical-align/baseline': false
    '@strip-periods/true': Zotero.CiteProc.CSL.Output.Formatters.passthrough
    '@strip-periods/false': Zotero.CiteProc.CSL.Output.Formatters.passthrough
    '@quotes/true': (state, str) ->
      return '``' unless str?
      return "``" + str + "''"

    '@quotes/inner': (state, str) ->
      return "'"  unless str?
      return "`" + str + "'"

    '@quotes/false': false

    # When opt.development_extensions.apply_citation_wrapper = true and
    # state.sys.wrapCitationEntry is defined.
    #
    '@cite/entry': (state, str) ->
      Zotero.BetterBibTeX.debug('bbl.@cite/entry:', state.registry.registry[@system_id].ref.id)
      return state.sys.wrapCitationEntry(str, this.item_id, this.locator_txt, this.suffix_txt)

    # I've seen errors from TeXmacs when the BibTeX key has a trailing
    # "_". I won't correct that here. It can be corrected by more
    # carefully defining the means by which they are formed, a user
    # option inside Better BibTeX for Zotero.
    #
    '@bibliography/entry': (state, str) ->
      sys_id = state.registry.registry[@system_id].ref.id
      Zotero.BetterBibTeX.debug('bbl.@bibliography/entry:', sys_id)
      try
        citekey = Zotero.BetterBibTeX.keymanager.get({itemID: sys_id}).citekey
      catch
        citekey = '@@'

      insert = ""
      insert = state.sys.embedBibliographyEntry(this.item_id) if state.sys.embedBibliographyEntry

      # For use with actual LaTeX, the \zbibItemText and \zbibCitationItemId macro will need to
      # be defined in some way. They can expand to nothing and hopefully that will suffice to
      # prevent an error. With TeXmacs, the\zbibCitationItemId macro will be run by the
      # typesetter, to supply reference binding information for use in hyperlinking. Each zcite
      # has the id of each item in the cluster in a JSON string saved in the fieldCode
      # argument. That can be accessed by the Guile Scheme code that implements the TeXmacs <==>
      # Juris-M / Zotero integration. In order for the \ztbibItemText
      #
      return "\\ztbibItemText{\\zbibCitationItemID{#{sys_id}}#{insert}\\bibitem{#{citekey}}#{str}}\n\n"

    # Again, another macro to turn the ztNewBlock into a LaTeX newblock: "\n\\newblock #{str}\n"
    #
    '@display/block': (state, str) -> "\\ztNewBlock{#{str}}\n"

    # \leftmargin{1. }\rightinline{body of bibentry}
    #
    '@display/left-margin': (state, str) -> "\\ztLeftMargin{#{str}}"
    '@display/right-inline': (state, str) -> "\\ztRightInline{#{str}}\n"

    # Must define a \ztbibindent macro just to be sure... I've not seen this output?
    #
    '@display/indent': (state, str) -> "\\ztbibIndent{#{str}}\n"

    # If these are output, obviously the the macro must be defined to something.
    # It will emit these only when
    # development_extensions.csl_reverse_lookup_support = true
    # in citeproc.js, which must be set at build time.
    #
    '@showid/true': (state, str, cslid) ->
      if !state.tmp.just_looking && !state.tmp.suppress_decorations
        if cslid
          return "\\ztShowID{#{state.opt.nodenames[cslid]}}{#{cslid}}{#{str}}"
        else if this.params && "string" == typeof str
          prePunct = ""
          if str
            m = str.match(CSL.VARIABLE_WRAPPER_PREPUNCT_REX)
            prePunct = m[1]
            str = m[2]
          postPunct = ""
          if str && CSL.SWAPPING_PUNCTUATION.indexOf(str.slice(-1)) > -1
            postPunct = str.slice(-1)
            str = str.slice(0,-1)
          return state.sys.variableWrapper(this.params, prePunct, str, postPunct)
        else
          return str
      else
        return str

    # \href and \url are from the hyperref package for pdflatex... but
    # TeXmacs processes them specially; it turns them into \hlink
    # which is a primitive, defined in C++, that I can not redefine
    # the way I need to so that the rendering decision can be made in
    # the style sheet, in order to make the links become footnotes
    # when in-text. So yet another macro wrapper is needed here as
    # well. For use with LaTeX, just define this macro to expand the
    # way you want.  \ztHref{url-location}{displayed-text}.
    #
    '@URL/true': (state, str) -> "\\ztHref{#{str}}{#{str}}"

    # In some styles, a DOI link is displayed prefixed with "doi:",
    # but in others it is displayed prefixed with
    # "http://doi.org/". That text is not part of the link's hyperlink
    # locus (lights up when I fly the mouse over it) in either
    # case. That is why the following does NOT have the http... part
    # inside of the second field.
    #
    '@DOI/true': (state, str) -> "\\ztHref{http://dx.doi.org/#{str}}{#{str}}"
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


Zotero.BetterBibTeX.schomd.getStyle = (id = 'apa') ->
  style = Zotero.Styles.get("http://www.zotero.org/styles/#{id}")
  style ||= Zotero.Styles.get("http://juris-m.github.io/styles/#{id}")
  style ||= Zotero.Styles.get(id)
  return style


Zotero.BetterBibTeX.schomd.citations = (citekeys, {format, style, libraryID} = {}) ->
  format ||= 'markdown'

  style = @getStyle(style)
  cp = style.getCiteProc()
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
      citations.push(null)
    else
      citations.push(cp.appendCitationCluster({citationItems: cluster, properties:{}}, true)[0][1] || null)

  # Setting an abbrev to X-X-X allows it to be an empty string this
  # way. You can not set an abbrev to the empty string because that's
  # how the interface allows resetting it to the default. So set it to
  # X-X-X and presto! It disappears.
  citations = (citation.replace(/X-X-X ?/g, "") for citation in citations when citation)

  switch format
    when 'markdown', 'html'
      return citations

    when 'bbl'
      return (citation.replace(/(\w\.}?) /g, "$1\\hspace{1spc}").replace(/(\w\.)! /g, "$1 ") for citation in citations when citation)

    else
      throw new Error("schomd.citations: unsupported format #{format}")

Zotero.BetterBibTeX.schomd.citation = (citekeys, {format, style, libraryID} = {}) ->
  format ||= 'markdown'
  itemIDs = (item for item in @itemIDs(citekeys, {libraryID}) when item)

  Zotero.BetterBibTeX.debug('schomd.citation', {citekeys, style, libraryID}, '->', itemIDs)

  return '' if itemIDs.length == 0

  style = @getStyle(style)
  cp = style.getCiteProc()
  cp.setOutputFormat(format)
  cp.updateItems(itemIDs)

  citation = cp.appendCitationCluster({citationItems: ({id:itemID} for itemID in itemIDs), properties:{}}, true)
  Zotero.BetterBibTeX.debug('schomd.citation:', citekeys, '->', JSON.stringify(citation))
  citation = citation[0][1]

  switch format
    when 'markdown', 'html'
      return citation

    when 'bbl'
      return citation.replace(/(\w\.}?) /g, "$1\\hspace{1spc}")

    else
      throw new Error("schomd.citation: unsupported format #{format}")

Zotero.BetterBibTeX.schomd.bibliography = (citekeys, {format, style, libraryID} = {}) ->
  format ||= 'markdown'
  itemIDs = @itemIDs(citekeys, {libraryID})
  return '' if itemIDs.length == 0

  # ditch unresolved citation keys
  itemIDs = (item for item in itemIDs when item)

  if format != 'yaml'
    style = @getStyle(style)
    cp = style.getCiteProc()
    cp.setOutputFormat(format)
    cp.updateItems(itemIDs)
    bib = cp.makeBibliography()

  switch format
    when 'markdown', 'html'
      return '' unless bib
      return bib[0].bibstart + bib[1].join("") + bib[0].bibend

    when 'yaml'
      items = Zotero.Items.get(itemIDs)

      deferred = Q.defer()
      Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator('bettercslyaml'), {items}, {}, (err, result) ->
        if err
          deferred.reject(err)
        else
          deferred.fulfill(result)
      )
      return deferred.promise

    when 'bbl'
      return '' unless bib
      bibl = (b.replace(/(\w\.}?) /g, "$1\\hspace{1spc}") for b in bib[1])
      bibstart = bib[0].bibstart
      return bibstart.replace(/9999/,("0" for n in [1..bib[0].maxoffset]).join("")) + bibl.join("") + bib[0].bibend

    else
      throw new Error("schomd.bibliography: unsupported format #{format}")

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

  return '' if itemIDs.length == 0

  items = Zotero.Items.get(itemIDs)
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
