fs = require("fs")
filename = 'test/fixtures/import/Math markup to unicode not always imported correctly #472.bib'
input = fs.readFileSync(filename, "utf8")

parsed = BetterBibTeXParser.parse(input)
console.log(parsed.references[1].title)
fs.writeFileSync('output.txt', parsed.references[1].title)
