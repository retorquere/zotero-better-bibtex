input = 'Between the Urban City and <the <span class="nocase">Rural</span>: <span class="nocase">Negotiating Place</span> and <span class="nocase">Identity</span> in a <span class="nocase">Danish Suburban Housing Area</span>'
input = 'USGS monitoring ecological impacts'
input = "P. M. S. \\ensuremath<span class='Hi'\\ensuremath>Hacker\\ensuremath</span\\ensuremath> 1. The ?confusion of psychology? On the concluding page of what is now called ?Part II? of the Investigations, Wittgenstein wrote.."
input = "The physical: violent <span id='none'>volcanology</span> of <span>the</span> 1600 eruption of Huaynaputina, southern Peru"
input = "Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial DNA<sub>2</sub> sequences suggest unexpected phylogenetic position of Corso-Sardinian grass snakes (<i>Natrix cetti</i>) and <b>do not</b> support their <span style=\"small-caps\">species status</span>, with notes on phylogeography and subspecies delineation of grass snakes."

{html, pre} = BetterBibTeXMarkupParser.parse(input, {preserveCaps: true})

console.log(input)
console.log(html)
