html = "Dr. Strangelove or: how I learned to stop worrying and love the bomb"

Translator.csquotes = {
  open: '‹«'
  close: '›»'
}

tokenize = (html) ->
  console.log(html)
  ast = Translator.MarkupParser.parse(html, {preserveCase: true})
  console.log(JSON.stringify(ast))
  console.log(LaTeX.text2latex(html, {preserveCase: true}))
  #console.log(Translator.TitleCaser.titleCase(html))

tokenize(html)
