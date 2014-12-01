LaTeX = {}

require('latex_unicode_mapping.coffee')
require('Unicode2LaTeX.js')

LaTeX.html2latex = (text) ->
  Translator.log("Translator mode: #{if Translator.unicode then 'unicode' else 'ascii'}")
  return BetterBibTeXUnicode2LaTeX.parse(text, {unicode: Translator.unicode})
