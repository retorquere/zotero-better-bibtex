
Translator.csquotes = {
  open: '‹«'
  close: '›»'
}
Translator.unicode = true

Translator.titleCaseLowerCase = '''
  about above across afore after against along
  alongside amid amidst among amongst anenst apropos apud around as
  aside astride at athwart atop barring before behind below beneath
  beside besides between beyond but by circa despite down during
  except for forenenst from given in inside into lest like modulo
  near next notwithstanding of off on onto out over per plus pro qua
  sans since than through thru throughout thruout till to toward
  towards under underneath until unto up upon versus vs. v. vs v via
  vis-à-vis with within without according to ahead of apart from as
  for as of as per as regards aside from back to because of close to
  due to except for far from inside of instead of near to next to on
  to out from out of outside of prior to pursuant to rather than
  regardless of such as that of up to where as or yet so and nor a
  an the de d' von van c et ca thru according ahead apart regards
  back because close due far instead outside prior pursuant rather
  regardless such their where
'''.replace(/\n/g, ' ').trim().split(/\s+/)

class Reconstruct
  constructor: (ast) ->
    @html = ''

    @walk(ast)

  walk: (node) ->
    if node.name == '#text'
      @html += node.text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return

    for k of node
      node.attr[k] ||= '' unless k in ['children', 'name', 'attr', 'class']

    if node.name == 'span' && Object.keys(node.attr).length == 0
      for child in node.children
        @walk(child)
      return

    @html += "<#{node.name}"
    for k, v of node.attr
      @html += " #{k}='#{v}'"
    @html += '>'
    for child in node.children
      @walk(child)
    @html += "</#{node.name}>"

display = (html, options) ->
  console.log(html)
  ast = Translator.MarkupParser.parse(html, {caseConversion: true})
  console.log(JSON.stringify(ast, null, 2))
  console.log((new Reconstruct(ast)).html)
  console.log(LaTeX.text2latex(html, {caseConversion: true}))
  return

  lang = ((options.language || '<none>') + '        ').substr(0, 8)
  console.log(options.source)
  console.log("#{lang}: `#{html}`")

  console.log(Translator.TitleCaser.titleCase(html))

  options.caseConversion = ((options.language || 'en') == 'en')

  cp = LaTeX.text2latex(html, options)
  console.log("biblatex: {#{cp}}")
  console.log('')

html = '<i>Foo</i>'
display(html, {})
