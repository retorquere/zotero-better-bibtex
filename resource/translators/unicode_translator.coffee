LaTeX = {} unless LaTeX

LaTeX.text2latex = (text, options = {}) ->
  latex = @html2latex(@cleanHTML(text, options), options)
  return BetterBibTeXBraceBalancer.parse(latex) if latex.indexOf("\\{") >= 0 || latex.indexOf("\\textleftbrace") >= 0 || latex.indexOf("\\}") >= 0 || latex.indexOf("\\textrightbrace") >= 0
  return latex

LaTeX.preserveCaps =
  hasCapital: new XRegExp('\\p{Lu}')
  words: new XRegExp("""(
          # word with embedded punctuation
          ((?<boundary1>^|[^'\\p{N}\\p{L}])   (?<word1>[\\p{L}\\p{N}]+'[\\p{L}\\p{N}]+))
          |
          ((?<boundary2>^|[^-\\p{N}\\p{L}])   (?<word2>[\\p{L}\\p{N}]+[-\\p{L}\\p{N}]+[\\p{L}\\p{N}]))

          |
          # simple word
          ((?<boundary3>^|[^\\p{N}\\p{L}])    (?<word3>[\\p{L}\\p{N}]*\\p{Lu}[\\p{L}\\p{N}]*))
        )""", 'gx')
  initialCapOnly: new XRegExp("^\\p{Lu}\\p{Ll}*$")

  preserve: (value) ->
    return XRegExp.replace(value, @words, (match, matches...) =>
      pos = matches[matches.length - 2]
      for i in [1, 2, 3]
        boundary = match["boundary#{i}"]
        word = match["word#{i}"]
        break if typeof boundary == 'string'
      if !XRegExp.test(word, @hasCapital) || (pos == 0 && XRegExp.test(word, @initialCapOnly))
        return boundary + word
      else
        return "#{boundary}<span class=\"nocase\">#{word}</span><!-- nocase:end -->"
    )

LaTeX.cleanHTML = (text, options) ->
  html = ''
  cdata = false

  if Translator.csquotes.length > 0
    open = ''
    close = ''
    for ch, i in Translator.csquotes
      if i % 2 == 0 # open
        open += ch
      else
        close += ch
    text = text.replace(new RegExp("[#{open}][\\s\\u00A0]?", 'g'), '<span enquote="true">')
    text = text.replace(new RegExp("[\\s\\u00A0]?[#{close}]", 'g'), '</span>')

  text = text.replace(/<pre[^>]*>(.*?)<\/pre[^>]*>/g, (match, pre) -> "<pre>#{Translator.HTMLEncode(pre)}</pre>")
  if options.autoCase
    text = LaTeX.preserveCaps.preserve(text)
    while true
      txt = text.replace('</span><!-- nocase:end --> <span class="nocase">', ' ')
      break if txt == text
      text = txt
    text = text.replace(/<!-- nocase:end -->/g, '')
  for chunk, i in text.split(/(<\/?(?:i|italic|b|sub|sup|pre|sc|span)(?:[^>a-z][^>]*)?>)/i)
    if i % 2 == 0 # text
      html += Translator.HTMLEncode(chunk)
    else
      html += chunk

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

    @walk(Zotero.BetterBibTeX.HTMLParser(html))

  walk: (tag) ->
    return unless tag

    if tag.name == '#text'
      if @stack[0]?.name == 'pre'
        @latex += tag.text
      else
        @chars(tag.text)
      return

    @stack.unshift(tag)

    switch tag.name
      when 'i', 'em', 'italic'
        @latex += '\\emph{'

      when 'b', 'strong'
        @latex += '\\textbf{'

      when 'a'
        # zotero://open-pdf/0_5P2KA4XM/7 is actually a reference.
        if tag.attrs.href?.length > 0
          @latex += "\\href{#{tag.attrs.href}}{"

      when 'sup'
        @latex += '\\textsuperscript{'

      when 'sub'
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

        @latex += '{{' if tag.class.nocase
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
      when 'i', 'italic', 'em', 'sup', 'sub', 'b', 'strong'
        @latex += '}'

      when 'a'
        @latex += '}' if tag.attrs.href?.length > 0

      when 'h1', 'h2', 'h3', 'h4'
        @latex += "}\n\n"

      when 'p', 'div', 'table', 'tr'
        @latex += "\n\n"

      when 'span', 'sc'
        @latex += '}' if tag.smallcaps
        @latex += '}' if tag.enquote
        @latex += '}}' if tag.class.nocase

      when 'td', 'th'
        @latex += ' '

      when 'ol'
        @latex += "\n\n\\end{enumerate}\n"
      when 'ul'
        @latex += "\n\n\\end{itemize}\n"

    @stack.shift()

  chars: (text) ->
    if Translator.titleCase && @options.autoCase && !@stack.find((tag) -> tag.class.nocase)
      # dupe the titlecaser into handling partial sentences, would change embedded 'the' to 'The' at the start of a
      # partial otherwise
      prefix = if @latex == '' then '' else '$ '
      cased = ''
      for chunk in text.split(/([\(\)])/)
        cased += Zotero.BetterBibTeX.CSL.titleCase(prefix + chunk).slice(prefix.length)
        prefix = '$ '
      text = cased

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

## MarkDown = {}
## class MarkDown.HTML
##   constructor: (html) ->
##     @md = ''
##     @stack = []
##
##     @walk(LaTeX.HTMLParser(html))
##
##   walk: (node) ->
##     return unless node
##     tag = {name: node.nodeName.toLowerCase(), attrs: {}}
##
##     return @chars(node.textContent) if tag.name == '#text'
##     return @cdata(node.textContent) if tag.name == '#cdata-section'
##
##     if node.hasAttributes()
##       for attr in node.attributes
##         tags.attrs[attr.name] = attr.value
##
##     @stack.unshift(tag)
##
##     switch tag.name
##       when 'i', 'em', 'italic'
##         @md += '_'
##
##       when 'b', 'strong'
##         @md += '**'
##
##       when 'a'
##         @md += '[' if tag.attrs.href?.length > 0
##
##       when 'sup'
##         @md += '<sup>'
##       when 'sub'
##         @md += '<sub>'
##
##       when 'br'
##         @md += "  \n"
##
##       when 'p', 'div', 'table', 'tr'
##         @md += "\n\n"
##
##       when 'h1', 'h2', 'h3', 'h4'
##         @md += "\n\n\\#{(new Array(parseInt(tag.name[1]))).join('#')} "
##
##       when 'ol', 'ul'
##         @md += "\n\n"
##
##       when 'li'
##         switch @stack[1]?.name
##           when 'ol'
##             @md += "\n1. "
##           when 'ul'
##             @md += "\n* "
##
##       when 'span', 'sc' then # ignore
##
##       when 'td', 'th'
##         @md += ' '
##
##       when 'tbody' then # ignore
##
##       else
##         Translator.debug("unexpected tag '#{tag.name}'")
##
##     for child in node.children
##       @walk(child)
##
##     switch tag.name
##       when 'i', 'italic', 'em'
##         @md += '_'
##
##       when 'sup', 'sub'
##         @md += "</#{tag.name}>"
##
##       when 'b', 'strong'
##         @md += '**'
##
##       when 'a'
##         @md += "](#{tag.attrs.href})" if tag.attrs.href?.length > 0
##
##       when 'h1', 'h2', 'h3', 'h4' then #ignore
##
##       when 'p', 'div', 'table', 'tr'
##         @md += "\n\n"
##
##       when 'span', 'sc' then # ignore
##
##       when 'td', 'th'
##         @md += ' '
##
##       when 'ol', 'ul'
##         @md += "\n\n"
##
##     @stack.shift()
##
##   cdata: (text) ->
##     @md += text
##
##   chars: (text) ->
##     txt = LaTeX.he.decode(text)
##
##     txt = txt.replace(/([-"\\`\*_{}\[\]\(\)#\+!])/g, "\\$1")
##     txt = txt.replace(/(^|[\n])(\s*[0-9]+)\.(\s)/g, "$1\\.$2")
##     @md += text
