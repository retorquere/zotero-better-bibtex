input = 'Between the Urban City and <the <span class="nocase">Rural</span>: <span class="nocase">Negotiating Place</span> and <span class="nocase">Identity</span> in a <span class="nocase">Danish Suburban Housing Area</span>'
input = 'USGS monitoring ecological impacts'
input = "P. M. S. \\ensuremath<span class='Hi'\\ensuremath>Hacker\\ensuremath</span\\ensuremath> 1. The ?confusion of psychology? On the concluding page of what is now called ?Part II? of the Investigations, Wittgenstein wrote.."
{html, pre} = BetterBibTeXMarkupParser.parse(input, {preserveCaps: true})

console.log(input)
console.log(html)
