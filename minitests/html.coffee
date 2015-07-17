html = '''
  Contrary to <sup>popular</sup> <sub>belief</sub>, <i>Lorem</i> <b>Ipsum</b> <span>is</span> <span class="smallcaps">not</span> simply random text. It has roots, and i < 2
'''
html = "The physical volcanology of the 1600 eruption of Huaynaputina, with <pre>\\LaTeX</pre>!"
html = "The physical: violent <span id='none'>volcanology</span> of <span>the</span> 1600 eruption of Huaynaputina, southern Peru"

html = "Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial <pre>DNA<sub>2</sub></pre> sequences suggest unexpected phylogenetic position of Corso-Sardinian grass snakes (<i>Natrix cetti</i>) and <b>do not</b> support their <span style=\"small-caps\">species status</span>, with notes on phylogeography and subspecies delineation of grass snakes."
html = "The physical volcanology of the 1600 eruption of Huaynaputina, with <pre>\\LaTeX</pre>!"

#console.log(LaTeX.cleanHTML(html))
#console.log(LaTeX.html2latex(LaTeX.cleanHTML(html)))

abstractNote = "In 2011 the international <are> development community committed to make development co-operation more effective to deliver better results for the world&#8217;s poor. At the mid-point between commitments endorsed in the High-Level Forum in Busan, Korea in 2011 and the 2015 target date of the Millennium Development Goals,&nbsp; this report takes stock of how far we have come and where urgent challenges lie. This report - a first snapshot of the state-of-play since Busan - reveals both successes and shortfalls. It draws on the ten indicators of the Global Partnership monitoring framework. Despite global economic turbulence, changing political landscapes and domestic budgetary pressure, commitment to effective development co-operation principles remains strong. Longstanding efforts to change the way that development co-operation is delivered are paying off. Past achievements on important aid effectiveness commitments that date back to 2005 have been sustained. Nevertheless, much more needs to be done to translate political commitments into concrete action. This report highlights where targeted efforts are needed to make further progress and to reach existing targets for more effective development co-operation by 2015."

console.log("\ndecode")
console.log(LaTeX.he.decode(abstractNote))
console.log("\nclean")
console.log(LaTeX.cleanHTML(abstractNote))
console.log("\nlatex")
console.log(LaTeX.html2latex(LaTeX.cleanHTML(abstractNote)))
