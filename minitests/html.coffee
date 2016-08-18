
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

display = (html, options) ->
  lang = ((options.language || '<none>') + '        ').substr(0, 8)
  console.log(options.source)
  console.log("#{lang}: `#{html}`")
  #ast = Translator.MarkupParser.parse(html, {preserveCase: true})
  #console.log(JSON.stringify(ast))
  console.log(Translator.TitleCaser.titleCase(html))

  options.caseConversion = ((options.language || 'en') == 'en')

  cp = LaTeX.text2latex(html, options)
  console.log("biblatex: {#{cp}}")
  console.log('')


html = "The largest U.S. companies would owe $620 billion in U.S. taxes on the cash they store in tax havens, the equivalent of our defense budget. [Tweet]"
display(html, {})
