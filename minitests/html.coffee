html = "11-Oxygenated Steroids. XIII. Synthesis and proof of structure of <span class=\"nocase\">Δ1,4-Pregnadiene-17α,21-diol-3,11,20-trione and Δ1,4-Pregnadiene-11β,17α,21-triol-3,20-dione</span>"

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
