LaTeX = {}
require('latex_unicode_mapping.coffee')

LaTeX.html = Object.create(null)
LaTeX.html.sup = {prefix: '\\textsuperscript{', postfix: '}'}
LaTeX.html.sub = {prefix: '\\textsubscript{', postfix: '}'}
LaTeX.html.i = {prefix: '\\emph{', postfix: '}'}
LaTeX.html.b = {prefix: '\\textbf{', postfix: '}'}
LaTeX.html.span = {prefix: '', postfix: ''}
LaTeX.html.smallcaps = {prefix: '\\textsc{', postfix: '}'}

LaTeX.html2latex = (text) ->
  stack = []
  mapping = if Translator.unicode then @toLaTeX.unicode else @toLaTeX.ascii

  acc = ''

  while text.length > 0
    if m = text.match(/^<pre>(.*?)<\/pre>?(.*)/i)
      acc += m[1]
      text = m[2]
      continue

    if m = text.match(/^<\/?(br|break|p)(\s[^>]*)?\/?>(.*)/i)
      acc += "\n\n"
      text = m[3]
      continue

    if m = text.match(/^<(sup|sub|i|b|span)(\s[^>]*)?>(.*)/i)
      tag = m[1].toLowerCase()
      repl = if tag == 'span' && m[2].toLowerCase().match(/small-caps/) then 'smallcaps' else tag
      stack.unshift({tag: tag, postfix: @html[repl].postfix})
      acc += @html[repl].prefix
      text = m[3]
      continue

    if m = text.match(/^<\/(sup|sub|i|b|span)(\s[^>]*)?>(.*)/i)
      tag = m[1].toLowerCase()

      while stack.length > 0
        acc += stack[0].postfix
        break if stack.shift().tag == tag

      text = m[3]
      continue

    found = false
    for matcher in ['math', 'text']
      len = 0
      _acc = ''
      while len < text.length && mapping[matcher][text[len]]
        _acc += mapping[matcher][text[len]]
        len += 1
      if len > 0
        found = true
        if matcher == 'math'
          acc += "\\ensuremath{#{_acc}}"
        else
          acc += _acc
        text = text.substring(len)

    if !found
      acc += text[0]
      text = text.substring(1)

  for tag in stack.reverse()
    acc += tag.postfix

  return acc
