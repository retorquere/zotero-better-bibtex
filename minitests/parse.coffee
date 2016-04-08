fs = require("fs")
filename = 'test/fixtures/import/Math markup to unicode not always imported correctly #472.bib'
filename = 'test/fixtures/import/Failure to handle unparsed author names (92).bib'
filename = 'test/fixtures/import/Better BibTeX.007.bib'
input = fs.readFileSync(filename, "utf8")

Zotero =
  debug: (msg) -> console.log(msg)

console.log(input)
parsed = BetterBibTeXParser.parse(input, {raw: false})
stuff = parsed.references[0].author[2].lastName
console.log(stuff)
fs.writeFileSync('output.txt', stuff)
