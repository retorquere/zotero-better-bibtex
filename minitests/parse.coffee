fs = require("fs")
filename = 'test/fixtures/import/Problem when importing BibTeX entries with square brackets #94.bib'
input = fs.readFileSync(filename, "utf8")

console.log(BetterBibTeXParser.parse(input))
