LaTeX = {} unless LaTeX

LaTeX.text2latex = (text, options = {}) ->
  latex = @html2latex(@cleanHTML(text, options), options)
  latex = BetterBibTeXBraceBalancer.parse(latex) if latex.indexOf("\\{") >= 0 || latex.indexOf("\\textleftbrace") >= 0 || latex.indexOf("\\}") >= 0 || latex.indexOf("\\textrightbrace") >= 0
  return latex

LaTeX.toTitleCase = (string) ->
  smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i

  # Force a word to lowercase if all of the following apply
  # 1. It is not the first word of the sentence, as smallwords at the start should be uppercased
  # 2. It is not the last word of the sentence (similar)
  # 3. It is a smallWord
  # 4. There is not a ':' two positions before the word (indicates subtitle)
  # 5. There is either not a dash immediately after the word, or there is a dash immediately preceding the word
  # 6. There is a space or a dash before the word
  # [0-9a-z\xD7\xDF-\xFF] = -Lu
  return string.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (match, index, title) ->
    if index > 0 and
      index + match.length != title.length and
      match.search(smallWords) > -1 and
      title.charAt(index - 2) != ':' and
      (title.charAt(index + match.length) != '-' or title.charAt(index - 1) == '-') and
      title.charAt(index - 1).search(/[^\s-]/) < 0
        return match.toLowerCase()

    # leave a word alone if it has an uppercase letter at the second position,
    # or the second character is a period followed by anything
    return match if match.substr(1).search(/[A-Z]|\../) > -1

    # uppercase
    return match.charAt(0).toUpperCase() + match.substr(1)
  )

LaTeX.cleanHTML = (text, options) ->
  {html, plain} = BetterBibTeXMarkupParser.parse(text, {titleCase: Translator.titleCase, preserveCaps: options.autoCase, csquotes: Translator.csquotes})

  if options.autoCase && Translator.titleCase
    titleCased = Zotero.BetterBibTeX.CSL.titleCase(plain.text)
    _html = ''
    for c, i in html
      if plain.unprotected[i] != undefined
        _html += titleCased[plain.unprotected[i]]
      else
        _html += c
    html = _html

  return html

LaTeX.html2latex = (html, options) ->
  latex = (new @HTML(html, options)).latex
  latex = latex.replace(/(\\\\)+\s*\n\n/g, "\n\n")
  latex = latex.replace(/\n\n\n+/g, "\n\n")
  return latex

class LaTeX.HTML
  constructor: (html, @options = {}) ->
    @latex = ''
    @mapping = (if Translator.unicode then LaTeX.toLaTeX.unicode else LaTeX.toLaTeX.ascii)
    @stack = []
    @preserveCase = 0

    @walk(Zotero.BetterBibTeX.HTMLParser(html))

  walk: (tag) ->
    return unless tag

    switch tag.name
      when '#text'
        @chars(tag.text)
        return
      when 'script'
        @latex += tag.text
        return

    @stack.unshift(tag)

    switch tag.name
      when 'i', 'em', 'italic'
        @latex += '{' if @options.autoCase && !@preserveCase
        @latex += '\\emph{'

      when 'b', 'strong'
        @latex += '{' if @options.autoCase && !@preserveCase
        @latex += '\\textbf{'

      when 'a'
        # zotero://open-pdf/0_5P2KA4XM/7 is actually a reference.
        if tag.attrs.href?.length > 0
          @latex += "\\href{#{tag.attrs.href}}{"

      when 'sup'
        @latex += '{' if @options.autoCase && !@preserveCase
        @latex += '\\textsuperscript{'

      when 'sub'
        @latex += '{' if @options.autoCase && !@preserveCase
        @latex += '\\textsubscript{'

      when 'br'
        # line-breaks on empty line makes LaTeX sad
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

      when 'span', 'sc'
        tag.smallcaps = tag.name == 'sc' || (tag.attrs.style || '').match(/small-caps/i)
        tag.enquote = (tag.attrs.enquote == 'true')

        @preserveCase += 1 if tag.class.nocase

        @latex += '{{' if tag.class.nocase && @preserveCase == 1

        @latex += '{' if @options.autoCase && !@preserveCase && (tag.enquote || tag.smallcaps)
        @latex += '\\enquote{' if tag.enquote
        @latex += '\\textsc{' if tag.smallcaps

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
        @latex += '}' if @options.autoCase && !@preserveCase

      when 'sup', 'sub', 'b', 'strong'
        @latex += '}'
        @latex += '}' if @options.autoCase && !@preserveCase

      when 'a'
        @latex += '}' if tag.attrs.href?.length > 0

      when 'h1', 'h2', 'h3', 'h4'
        @latex += "}\n\n"

      when 'p', 'div', 'table', 'tr'
        @latex += "\n\n"

      when 'span', 'sc'
        @latex += '}' if tag.smallcaps
        @latex += '}' if tag.enquote
        @latex += '{' if @options.autoCase && !@preserveCase && (tag.smallcaps || tag.enquote)

        @latex += '}}' if tag.class.nocase && @options.autoCase && @preserveCase == 1

        @preserveCase -= 1 if tag.class.nocase

      when 'td', 'th'
        @latex += ' '

      when 'ol'
        @latex += "\n\n\\end{enumerate}\n"
      when 'ul'
        @latex += "\n\n\\end{itemize}\n"

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
