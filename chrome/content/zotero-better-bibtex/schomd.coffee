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
      return text.replace(/([-"\\`\*_{}\[\]\(\)#\+!])/g, "\\$1").replace(Zotero.CiteProc.CSL.SUPERSCRIPTS_REGEXP, ((aChar) -> "<sup>#{Zotero.CiteProc.CSL.SUPERSCRIPTS[aChar]}</sup>"))

    bibstart: "<bibliography>\n"
    bibend: '</bibliography>'
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
      citekey = Zotero.BetterBibTeX.DB.valueQuery('select citekey from keys where itemID = ?', [state.registry.registry[@system_id].ref.id])
      return "[#{str}][@#{citekey}]"

    '@bibliography/entry': (state, str) ->
      citekey = Zotero.BetterBibTeX.DB.valueQuery('select citekey from keys where itemID = ?', [state.registry.registry[@system_id].ref.id])
      return "[@#{citekey}]: ##{citekey} \"#{str}\"\n<a name=\"#{citekey}\"></a>#{str}\n"

    '@display/block': (state, str) -> return "\n\n#{str}\n\n"

    '@display/left-margin': (state, str) -> return str

    '@display/right-inline': (state, str) -> return str

    '@display/indent': (state, str) -> return "\n&nbsp;&nbsp;&nbsp;&nbsp;#{str}"

    '@showid/true': (state, str, cslid) -> return str

    '@URL/true': (state, str) -> return "[#{str}](#{str})"
    '@DOI/true': (state, str) -> return "[#{str}](http://dx.doi.org/#{str})"

    "@quotes/false": false
  }
  return

Zotero.BetterBibTeX.schomd.citation = (citekeys) ->
  citekeys = [citekeys] unless Array.isArray(citekeys)
  return '' if citekeys.length == 0

  vars = ('?' for citekey in citekeys).join(',')
  items = Zotero.BetterBibTeX.DB.columnQuery("select itemID from keys where citekey in (#{vars})", citekeys)

  style = Zotero.Styles.get('http://www.zotero.org/styles/apa')
  cp = style.getCiteProc()
  cp.setOutputFormat('markdown')
  cp.updateItems(items)
  return (cp.appendCitationCluster({citationItems: [{id:item}], properties:{}}, true)[0][1] for item in items)

Zotero.BetterBibTeX.schomd.bibliography = (citekeys) ->
  citekeys = [citekeys] unless Array.isArray(citekeys)
  return '' if citekeys.length == 0

  vars = ('?' for citekey in citekeys).join(',')
  items = Zotero.BetterBibTeX.DB.columnQuery("select itemID from keys where citekey in (#{vars})", citekeys)

  style = Zotero.Styles.get('http://www.zotero.org/styles/apa')
  cp = style.getCiteProc()
  cp.setOutputFormat('markdown')
  cp.updateItems(items)
  bib = cp.makeBibliography()

  return '' unless bib
  return bib[0].bibstart + bib[1].join("") + bib[0].bibend
