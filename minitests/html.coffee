html = '''
  Contrary to <sup>popular</sup> <sub>belief</sub>, <i>Lorem</i> <b>Ipsum</b> <span>is</span> <span class="smallcaps">not</span> simply random text. It has roots, and i < 2
'''
html = "The physical volcanology of the 1600 eruption of Huaynaputina, with <pre>\\LaTeX</pre>!"
html = "The physical: violent <span id='none'>volcanology</span> of <span>the</span> 1600 eruption of Huaynaputina, southern Peru"

html = "Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial <pre>DNA<sub>2</sub></pre> sequences suggest unexpected phylogenetic position of Corso-Sardinian grass snakes (<i>Natrix cetti</i>) and <b>do not</b> support their <span style=\"small-caps\">species status</span>, with notes on phylogeography and subspecies delineation of grass snakes."

console.log(LaTeX.cleanHTML(html))
console.log(LaTeX.html2latex(LaTeX.cleanHTML(html)))
