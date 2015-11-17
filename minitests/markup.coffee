input = [
  'Between the Urban City and <the <span class="nocase">Rural</span>: <span class="nocase">Negotiating Place</span> and <span class="nocase">Identity</span> in a <span class="nocase">Danish Suburban Housing Area</span>'
  'USGS monitoring ecological impacts'
  "P. M. S. \\ensuremath<span class='Hi'\\ensuremath>Hacker\\ensuremath</span\\ensuremath> 1. The ?confusion of psychology? On the concluding page of what is now called ?Part II? of the Investigations, Wittgenstein wrote.."
  "The physical: violent <span id='none'>volcanology</span> of <span>the</span> 1600 eruption of Huaynaputina, southern Peru"
  "Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial DNA<sub>2</sub> sequences suggest unexpected phylogenetic position of Corso-Sardinian grass snakes (<i>Natrix cetti</i>) and <b>do not</b> support their <span style=\"small-caps\">species status</span>, with notes on phylogeography and subspecies delineation of grass snakes."
]

titleCase = (html, titleCased, positions) ->
  pt = ''
  for c, i in html
    if positions[i] != undefined
      pt += titleCased[positions[i]]
    else
      pt += c
  console.log('.: ' + pt)
  return pt

for text in input
  {html, plain} = BetterBibTeXMarkupParser.parse(text, {titleCase: true, preserveCaps: true})
  titlecased = new Array(plain.text.length + 1).join('.')
  console.log('')
  console.log('T: ' + text)
  console.log('H: ' + html)
  console.log('P: ' + plain.text)
  console.log('C: ' + titleCase(html, titlecased, plain.unprotected))
  break
