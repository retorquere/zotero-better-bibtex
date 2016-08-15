LaTeX = {} unless LaTeX

LaTeX.text2latex = (text, options = {}) ->
  options.mode ||= 'text'
  return @html2latex(text, options)

LaTeX.html2latex = (html, options) ->
  options.mode ||= 'html'
  latex = (new @HTML(html, options)).latex
  latex = latex.replace(/(\\\\)+\s*\n\n/g, "\n\n")
  latex = latex.replace(/\n\n\n+/g, "\n\n")
  latex = latex.replace(/{}([}])/g, '$1')
  return latex

class LaTeX.HTML
  constructor: (html, options = {}) ->
    @latex = ''
    @mapping = (if Translator.unicode then LaTeX.toLaTeX.unicode else LaTeX.toLaTeX.ascii)
    @stack = []

    @walk(Translator.MarkupParser.parse(html, options))

  walk: (tag) ->
    return unless tag

    switch tag.name
      when '#text'
        @chars(tag.text, tag.math)
        return
      when 'pre'
        @latex += tag.text
        return

    @stack.unshift(tag)

    @latex += '\\textsc{' if tag.smallcaps
    @latex += '{{'        if tag.nocase
    @latex += '{\\relax ' if tag.relax

    switch tag.name
      when 'i', 'em', 'italic'
        @latex += '\\emph{'

      when 'b', 'strong'
        @latex += '\\textbf{'

      when 'a'
        ### zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. ###
        if tag.attrs.href?.length > 0
          @latex += "\\href{#{tag.attrs.href}}{"

      when 'sup'
        @latex += '\\textsuperscript{'

      when 'sub'
        @latex += '\\textsubscript{'

      when 'br'
        ### line-breaks on empty line makes LaTeX sad ###
        @latex += "\\\\" if @latex != '' && @latex[@latex.length - 1] != "\n"
        @latex += "\n"

      when 'p', 'div', 'table', 'tr'
        @latex += "\n\n"

      when 'h1', 'h2', 'h3', 'h4'
        @latex += "\n\n\\#{(new Array(parseInt(tag.name[1]))).join('sub')}section{"

      when 'ol'
        @latex += "\n\n\\begin{enumerate}\n"
      when 'ul'
        @latex += "\n\n\\begin{itemize}\n"
      when 'li'
        @latex += "\n\\item "

      when 'enquote'
        @latex += '\\enquote{'

      when 'span', 'sc', 'nc' then # ignore, handled by the relax/nocase/smallcaps handler above

      when 'td', 'th'
        @latex += ' '

      when 'tbody', '#document', 'html', 'head', 'body' then # ignore

      else
        Translator.debug("unexpected tag '#{tag.name}' (#{Object.keys(tag)})")

    for child in tag.children
      @walk(child)

    switch tag.name
      when 'i', 'italic', 'em'
        @latex += '}'

      when 'sup', 'sub', 'b', 'strong'
        @latex += '}'

      when 'a'
        @latex += '}' if tag.attrs.href?.length > 0

      when 'h1', 'h2', 'h3', 'h4'
        @latex += "}\n\n"

      when 'p', 'div', 'table', 'tr'
        @latex += "\n\n"

      when 'td', 'th'
        @latex += ' '

      when 'enquote'
        @latex += '}'

      when 'ol'
        @latex += "\n\n\\end{enumerate}\n"
      when 'ul'
        @latex += "\n\n\\end{itemize}\n"

    @latex += '}' if tag.relax
    @latex += '}}' if tag.nocase
    @latex += '}' if tag.smallcaps

    @stack.shift()

  chars: (text, math) ->
    @latex += "$" if math

    ### balance out braces with invisible braces until http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754#comment545453_230754 is widely deployed ###
    braced = 0
    for c in XRegExp.split(text, '')
      switch c
        when '{' then braced += 1
        when '}' then braced -= 1
      if braced < 0
        @latex += "\\vphantom\\{"
        braced = 0
      @latex += @mapping.math[c] || @mapping.text[c] || c || ''
    switch braced
      when 0 then # pass
      when 1 then @latex += "\\vphantom\\}"
      else @latex += "\\vphantom{#{(new Array(braced + 1)).join("\\}")}}"

    @latex += '$' if math
