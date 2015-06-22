html = '''
  Contrary to <sup>popular</sup> <sub>belief</sub>, <i>Lorem</i> <b>Ipsum</b> <span>is</span> <span class="smallcaps">not</span> simply random text. It has roots
'''

class ToLaTeX
  constructor: ->
    @latex = ''

  tag: {
    sup:        '\\textsuperscript{'
    sub:        '\\textsubscript{'
    i:          '\\emph{'
    b:          '\\textbf{'
    span:       '{'
    smallcaps:  '\\textsc{'
  }

  start: (tag, attrs, unary) ->
    if !@tag[tag]
      attributes = ("#{attr.name}=\"#{attr.escaped}\"" for attr in attrs).join(' ')
      attributes = " #{attributes}" if attributes != ''
      text = "<#{tag}#{attributes}#{if unary then '/' else ''}>"
      @chars(text)
      return

    if tag == 'span'
      cls = (attr.value for attr in attrs when attr.name == 'class')[0] || ''
      tag = 'smallcaps' if cls.indexOf('smallcaps') >= 0

    @latex += @tag[tag]

  end: (tag) ->
    if @tag[tag]
      @latex += '}'
    else
      @chars("</#{tag}>")

  chars: (text) ->
    @latex += text

  comment: (text) ->

converter = new ToLaTeX()
HTMLParser(html, converter)

console.log(converter.latex)
