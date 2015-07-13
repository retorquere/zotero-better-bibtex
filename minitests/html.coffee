html = '''
  Contrary to <sup>popular</sup> <sub>belief</sub>, <i>Lorem</i> <b>Ipsum</b> <span>is</span> <span class="smallcaps">not</span> simply random text. It has roots, and i < 2
'''
html = "The physical volcanology of the 1600 eruption of Huaynaputina, with <pre>\\LaTeX</pre>!"

console.log(LaTeX.cleanHTML(html))
console.log(LaTeX.html2latex(LaTeX.cleanHTML(html)))
