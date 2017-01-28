titleCase = (string) ->
  return Zotero.BetterBibTeX.CSL.Output.Formatters.title(Zotero.BetterBibTeX.CSL.BetterBibTeX.state, string)

titles = [
  "The physical volcanology of the 1600 eruption of Huaynaputina, with <pre>\\LaTeX</pre>!"
  "The physical volcanology of the 1600 eruption of Huaynaputina, with                  !"
]

for title in titles
  console.log(title)
  console.log(titleCase(title))
  console.log('')

