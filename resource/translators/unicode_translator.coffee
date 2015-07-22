LaTeX = {} unless LaTeX

LaTeX.text2latex = (text) ->
  latex = @html2latex(@cleanHTML(text))
  return BetterBibTeXBraceBalancer.parse(latex) if latex.indexOf("\\{") >= 0 || latex.indexOf("\\textleftbrace") >= 0 || latex.indexOf("\\}") >= 0 || latex.indexOf("\\textrightbrace") >= 0
  return latex

LaTeX.cleanHTML = (text) ->
  html = ''
  cdata = false
  for chunk, i in text.split(/(<\/?(?:i|italic|b|sub|sup|pre|span)(?:[^>a-z][^>]*)?>)/i)
    switch
      when i % 2 == 0 # text
        html += LaTeX.he.escape(chunk)

      when chunk.match(/^<pre/i)
        html += '<![CDATA['
        cdata = true

      when chunk.match(/^<\/pre/i)
        html += ']]>'
        cdata = false

      else
        html += chunk

  html += ']]>' if cdata

  return html

LaTeX.html2latex = (html) ->
  return (new @HTML(html)).latex.trim().replace(/\n\n\n+/g, "\n\n")

class LaTeX.HTML
  constructor: (html) ->
    @latex = ''
    @stack = []
    @mapping = (if Translator.unicode then LaTeX.toLaTeX.unicode else LaTeX.toLaTeX.ascii)

    HTMLtoDOM.Parser(html, @)

  start: (tag, attrs, unary) ->
    tag = {name: tag, attrs: {}}
    for attr in attrs
      tag.attrs[attr.name.toLowerCase()] = attr.value
    @stack.unshift(tag) unless unary

    switch tag.name
      when 'i', 'em', 'italic'
        @latex += '\\emph{'
      when 'b', 'strong'
        @latex += '\\textbf{'

      when 'a'
        @latex += "\\href{#{tag.attrs.href}}{" if tag.attrs.href?.length > 0

      when 'sup'
        @latex += '\\textsuperscript{'
      when 'sub'
        @latex += '\\textsubscript{'

      when 'br'
        # line-breaks on empty line makes LaTeX sad
        @latex += "\\\\" if @latex != '' && @latex[@latex.length - 1] != "\n"
        @latex += "\n"

      when 'p', 'div'
        @latex += "\n\n"

      when 'h1', 'h2', 'h3', 'h4'
        @latex += "\n\n\\#{(new Array(parseInt(tag.name[1]))).join('sub')}section{"

      when 'ol'
        @latex += "\n\n\\begin{enumerate}\n"
      when 'ul'
        @latex += "\n\n\\begin{itemize}\n"
      when 'li'
        @latex += "\n\\item "

      when 'span'
        tag.smallcaps = 'small-caps' in (tag.attrs.style || '').split(/\s+/)
        @latex += '\\textsc{' if tag.smallcaps

      else
        throw new Error("unexpected tag '#{tag.name}'")

  end: (tag) ->
    tag = tag.toLowerCase()

    throw new Error("Unexpected close tag #{tag}") unless tag == @stack[0]?.name

    switch tag
      when 'i', 'italic', 'em', 'sup', 'sub', 'b', 'strong'
        @latex += '}'

      when 'a'
        @latex += '}' if @stack[0].attrs.href?.length > 0

      when 'h1', 'h2', 'h3', 'h4'
        @latex += "}\n\n"

      when 'p', 'div'
        @latex += "\n\n"

      when 'span'
        @latex += '}' if @stack[0].smallcaps

    @stack.shift()

  cdata: (text) ->
    @latex += text

  chars: (text) ->
    txt = LaTeX.he.decode(text)

    blocks = []
    for c in txt
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
