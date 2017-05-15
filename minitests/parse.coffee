fs = require("fs")

Zotero =
  debug: (msg) -> console.log(msg)

parse = (filename) ->
  input = fs.readFileSync(filename, "utf8")
  return globals.BetterBibTeXParser.parse(input, {verbose: true})

#parsed = parse('test/fixtures/import/Better BibTeX.007.bib')
#console.log(parsed.references[0].author[2].lastName)

#parsed = pars('test/fixtures/import/Failure to handle unparsed author names (92).bib')
#console.log(parsed.references[0].booktitle)

parsed = parse('test/fixtures/import/support Local-Zo-Url-x field from BibDesk2Zotero_attachments #667.bib')
console.log(parsed.references[0].title)
