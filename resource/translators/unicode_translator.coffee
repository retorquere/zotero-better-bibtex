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
      html += chunk
  return html

LaTeX.html2latex = (html, balancer) ->
  return (new @HTML(html)).latex.trim()

class LaTeX.HTML
  constructor: (html) ->
    @latex = ''
    @smallcaps = 0
    @pre = 0
    @mapping = (if Translator.unicode then LaTeX.toLaTeX.unicode else LaTeX.toLaTeX.ascii)

    HTMLParser(html, @)

  start: (tag, attrs, unary) ->
    if @pre > 0
      attributes = (" #{attr.name}='#{attr.escaped}'" for attr in attrs).join('')
      @latex += "<#{tag}#{attributes}#{(if unary then '/' else '')}>"
      return

    switch tag.toLowerCase()
      when 'i'    then @latex += '\\emph{'
      when 'sup'  then @latex += '\\textsuperscript{'
      when 'sub'  then @latex += '\\textsubscript{'
      when 'b'    then @latex += '\\textbf{'
      when 'br'   then @latex += "\\\\\n"
      when 'p'    then @latex += "\n\n"

      when 'pre'
        @pre++

      when 'span'
        smallcaps = false
        for own attr, value of attrs
          smallcaps ||= attr.toLowerCase() == 'style' && 'small-caps' in value.split(/\s+/)
        if smallcaps
          @smallcaps++
          @latex += '\\textsc{' if @smallcaps == 1

      else
        throw new Error("unexpected tag '#{tag}'")

  end: (tag) ->
    switch tag.toLowerCase()
      when 'i', 'sup', 'sub', 'b' then @latex += '}'
      when 'p'    then @latex += "\n\n"

      when 'pre'
        @pre--

      when 'span'
        if @smallcaps > 0
          @latex += '}'
          @smallcaps--

  chars: (text) ->
    for own char, re of LaTeX.entities
      text = text.replace(re, char)
    text = text.replace(/&#([0-9]{1,3});/gi, (match, charcode) -> String.fromCharCode(parseInt(charcode)))
    throw new Error("Unresolved entities: #{text}") if text.match(/&[a-z]+;/i)

    if @pre > 0
      @latex += text
      return

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
