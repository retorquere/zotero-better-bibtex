BetterBibTeX_MagicCitations = new class
  onLoad: ->
    search = document.getElementById('zotero-better-bibtex-search-citation')
    search.value = ''
    @refresh()
    window.sizeToContent()

  refresh: ->
    results = document.getElementById('zotero-better-bibtex-found-citations')
    results.removeChild(node) for node in results.children

    search = document.getElementById('zotero-better-bibtex-search-citation')
    value = search.value.toLowerCase()
    if value && value != ''
      for ref in items = (key for key in Zotero.BetterBibTeX.keymanager.keys.where((item) -> item.citekey.toLowerCase().indexOf(value) >= 0))
        new @HTML(results, "<i>#{ref.citekey}</i>")

  HTML: class
    constructor: (rlb, html) ->
      rli = document.createElement('richlistitem')
      rlb.appendChild(rli)

      @stack = [rli]
      @HTMLtoDOM.Parser(html, @)

    start: (tag, attrs, unary) ->
      tag = tag.toLowerCase()
      elt = document.createElementNS('http://www.w3.org/1999/xhtml', tag)
      for attr in attrs
        elt.setAttribute(attr.name.toLowerCase(), attr.value)

      @stack[0].appendChild(elt)
      @stack.unshift(elt) unless unary

    end: (tag) ->
      @stack.shift()

    cdata: (text) ->
      @stack[0].appendChild(document.createTextNode(text))

    chars: (text) ->
      @stack[0].appendChild(document.createTextNode(text))

Components.utils.import('resource://zotero-better-bibtex/translators/htmlparser.js', BetterBibTeX_MagicCitations.HTML::)
