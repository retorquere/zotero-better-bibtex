LaTeX = {} unless LaTeX

LaTeX.html2latex = (text) ->
  html = @marked(text)
  latex = (new @HTML(html)).latex

  return BetterBibTeXBraceBalancer.parse(latex) if latex.indexOf("\\{") >= 0 || latex.indexOf("\\textleftbrace") >= 0 || latex.indexOf("\\}") >= 0 || latex.indexOf("\\textrightbrace") >= 0
  return latex

class LaTeX.HTML
  constructor: (html) ->
    @latex = ''
    @smallcaps = 0
    @pre = 0
    @mapping = (if Translator.unicode then @toLaTeX.unicode else @toLaTeX.ascii)

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
    text = text.replace(/&gt;/gi, '>').replace(/&lt;/gi, '<').replace(/&amp;/gi, '&')
    blocks = []
    for c in text
      math = mapping.math[c]
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
