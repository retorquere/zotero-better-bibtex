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
  constructor: (html, @options = {}) ->
    @latex = ''
    @mapping = (if Translator.unicode then LaTeX.toLaTeX.unicode else LaTeX.toLaTeX.ascii)
    @stack = []

    @walk(Translator.MarkupParser.parse(html, @options))

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

    latex = '...' # default to no-op
    switch tag.name
      when 'i', 'em', 'italic'
        latex = '\\emph{...}'

      when 'b', 'strong'
        latex = '\\textbf{...}'

      when 'a'
        ### zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. ###
        latex = "\\href{#{tag.attrs.href}}{...}" if tag.attrs.href?.length > 0

      when 'sup'
        latex = '\\textsuperscript{...}'

      when 'sub'
        latex = '\\textsubscript{...}'

      when 'br'
        latex = ''
        ### line-breaks on empty line makes LaTeX sad ###
        latex = "\\\\" if @latex != '' && @latex[@latex.length - 1] != "\n"
        latex += "\n..."

      when 'p', 'div', 'table', 'tr'
        latex = "\n\n...\n\n"

      when 'h1', 'h2', 'h3', 'h4'
        latex = "\n\n\\#{(new Array(parseInt(tag.name[1]))).join('sub')}section{...}\n\n"

      when 'ol'
        latex = "\n\n\\begin{enumerate}\n...\n\n\\end{enumerate}\n"
      when 'ul'
        latex = "\n\n\\begin{itemize}\n...\n\n\\end{itemize}\n"
      when 'li'
        latex = "\n\\item ..."

      when 'enquote'
        if Translator.BetterBibTeX
          latex = '\\enquote{...}'
        else
          latex = '\\mkbibquote{...}'

      when 'span', 'sc', 'nc' then # ignore, handled by the relax/nocase/smallcaps handler below

      when 'td', 'th'
        latex = ' ... '

      when 'tbody', '#document', 'html', 'head', 'body' then # ignore

      else
        Translator.debug("unexpected tag '#{tag.name}' (#{Object.keys(tag)})")

    latex = @embrace(latex, latex.match(/^\\[a-z]+{\.\.\.}$/)) if latex != '...'
    latex = @embrace("\\textsc{#{latex}}", true) if tag.smallcaps
    latex = "{{#{latex}}}"         if tag.nocase
    latex = "{\\relax #{latex}}"   if tag.relax

    [prefix, postfix] = latex.split('...')

    @latex += prefix
    for child in tag.children
      @walk(child)
    @latex += postfix

    @stack.shift()

  embrace: (latex, condition) ->
    ### holy mother of %^$#^%$@ the bib(la)tex case conversion rules are insane ###
    ### https://github.com/retorquere/zotero-better-bibtex/issues/541 ###
    ### https://github.com/plk/biblatex/issues/459 ... oy! ###
    @embraced ?= @options.caseConversion && (((@latex || latex)[0] != '\\') || Translator.BetterBibTeX)
    return latex unless @embraced && condition
    return '{' + latex + '}'

  chars: (text) ->
    latex = ''
    math = false
    braced = 0

    for c in XRegExp.split(text, '')
      # in and out of math mode
      if !!@mapping.math[c] != math
        latex += '$'
        math = !!@mapping.math[c]

      ### balance out braces with invisible braces until http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754#comment545453_230754 is widely deployed ###
      switch c
        when '{' then braced += 1
        when '}' then braced -= 1
      if braced < 0
        latex += "\\vphantom\\{"
        braced = 0

      c = @mapping.math[c] || @mapping.text[c] || c
      latex += @embrace(c, LaTeX.toLaTeX.embrace[c])

    # add any missing closing phantom braces
    switch braced
      when 0 then # pass
      when 1 then latex += "\\vphantom\\}"
      else latex += "\\vphantom{#{(new Array(braced + 1)).join("\\}")}}"

    # might still be in math mode at the end
    latex += "$" if math

    ### minor cleanup ###
    latex = latex.replace(/([^\\])({})+([^0-9a-z])/ig, '$1$3')

    @latex += latex
