LaTeX = {} unless LaTeX

LaTeX.text2latex = (text) ->
  latex = @html2latex(@cleanHTML(text))
  return BetterBibTeXBraceBalancer.parse(latex) if latex.indexOf("\\{") >= 0 || latex.indexOf("\\textleftbrace") >= 0 || latex.indexOf("\\}") >= 0 || latex.indexOf("\\textrightbrace") >= 0
  return latex

LaTeX.cleanHTML = (text) ->
  html = ''
  for chunk, i in text.split(/(<\/?(?:i|b|sub|sup|pre|span)[^>]*>)/i)
    if i % 2 == 0 # text
      html += chunk.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    else
      switch
        when chunk.match(/^<pre/i)
          html += '<![CDATA['
        when chunk.match(/^<\/pre/i)
          html += ']]>'
        else
          html += chunk
  return html

LaTeX.html2latex = (html, balancer) ->
  return (new @HTML(html)).latex.trim().replace(/\n\n\n+/g, "\n\n")

class LaTeX.HTML
  constructor: (html) ->
    @latex = ''
    @stack = []
    @mapping = (if Translator.unicode then LaTeX.toLaTeX.unicode else LaTeX.toLaTeX.ascii)

    LaTeX.HTMLtoDOM.Parser(html, @)

  start: (tag, attrs, unary) ->
    tag = {name: tag.toLowerCase(), attrs: ({name: att.name.toLowerCase(), value: att.value, escaped: att.escaped} for att in attrs)}
    tag.smallcaps = tag.attrs.some((attr) -> attr.name == 'style' && 'small-caps' in attr.value.split(/\s+/))
    @stack.unshift(tag) unless unary

    switch tag.name
      when 'i'
        @latex += '\\emph{'
      when 'b'
        @latex += '\\textbf{'

      when 'sup'
        @latex += '\\textsuperscript{'
      when 'sub'
        @latex += '\\textsubscript{'

      when 'br'
        @latex += "\\\\\n"

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
        @latex += '\\textsc{' if tag.smallcaps

      else
        throw new Error("unexpected tag '#{tag}'")

  end: (tag) ->
    tag = tag.toLowerCase()

    throw new Error("Unexpected close tag #{tag}") if tag != @stack[0].name

    switch tag
      when 'i', 'sup', 'sub', 'b'
        @latex += '}'

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
    for own char, re of LaTeX.entities
      text = text.replace(re, char)
    text = text.replace(/&#([0-9]{1,3});/gi, (match, charcode) -> String.fromCharCode(parseInt(charcode)))
    throw new Error("Unresolved entities: #{text}") if text.match(/&[a-z]+;/i)

    blocks = []
    for c in text
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

  comment: (text) ->
