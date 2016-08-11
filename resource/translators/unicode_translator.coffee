LaTeX = {} unless LaTeX

LaTeX.text2latex = (text, options = {}) ->
  options.mode = 'text'
  latex = @html2latex(text, options)
  latex = BetterBibTeXBraceBalancer.parse(latex) if latex.indexOf("\\{") >= 0 || latex.indexOf("\\textleftbrace") >= 0 || latex.indexOf("\\}") >= 0 || latex.indexOf("\\textrightbrace") >= 0
  return latex

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

    @walk(Translator.HTMLParser.parse(html, options))

  walk: (tag) ->
    return unless tag

    switch tag.name
      when '#text'
        @chars(tag.text)
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

      when 'span', 'sc', 'nc' then # ignore, handled by the relax/nocase/smallcaps handler above

      when 'td', 'th'
        @latex += ' '

      when 'tbody', '#document', 'html', 'head', 'body' then # ignore

      else
        Translator.debug("unexpected tag '#{tag.name}'")

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

      when 'ol'
        @latex += "\n\n\\end{enumerate}\n"
      when 'ul'
        @latex += "\n\n\\end{itemize}\n"

    @latex += '}' if tag.relax
    @latex += '}' if tag.nocase
    @latex += '}' if tag.smallcaps

    @stack.shift()

  chars: (text) ->
    blocks = []
    for c in XRegExp.split(text, '')
      math = @mapping.math[c]
      blocks.unshift({math: !!math, text: ''}) if blocks.length == 0 || blocks[0].math != !!math
      blocks[0].text += (math || @mapping.text[c] || c)
    for block in blocks by -1
      if block.math
        if block.text.match(/^{[^{}]*}$/)
          @latex += "\\ensuremath#{block.text}"
        else
          @latex += "\\ensuremath{#{block.text}}"
      else
        @latex += block.text
