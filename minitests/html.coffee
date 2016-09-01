
Translator.csquotes = {
  open: '‹«'
  close: '›»'
}
Translator.unicode = true
Translator.BetterBibTeX = false
Translator.BetterBibLaTeX = true

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

display = (html, options) ->
  console.log(html, options)
  ast = Translator.MarkupParser.parse(html, options)
  console.log(JSON.stringify(ast, null, 2))
  # console.log((new Reconstruct(ast)).html)
  # console.log(LaTeX.text2latex(html, options))
  return

  lang = ((options.language || '<none>') + '        ').substr(0, 8)
  console.log(options.source)
  console.log("#{lang}: `#{html}`")

  console.log(Translator.TitleCaser.titleCase(html))

  options.caseConversion = ((options.language || 'en') == 'en')

  cp = LaTeX.text2latex(html, options)
  console.log("biblatex: {#{cp}}")
  console.log('')

html = '<i><span class=\"nocase\">Nodo unitatis et caritatis</span></i>: The <pre>Structure</pre> and Argument of Augustine\'s <i><span class=\"nocase\">De doctrina Christiana</span></i>'
html = "Hello <pre> hej </pre>"
display(html, {mode: 'html'})
display(html, {caseConversion: true})
