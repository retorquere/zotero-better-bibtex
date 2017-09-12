#BibTeXParser = require('biblatex-csl-converter').BibLatexParser
BibTeXParser = require('../../biblatex-csl-converter').BibLatexParser
fs = require('fs')

importReferences = (input) ->
  parser = new BibTeXParser(input, {
    rawFields: true,
    processUnexpected: true,
    processUnknown: {
      comment: 'f_verbatim'
    }
  })

  ### this must be called before requesting warnings or errors -- this really, really weirds me out ###
  references = parser.output

  ### relies on side effect of calling '.output' ###
  return {
    references: references,
    groups: parser.groups,
    errors: parser.errors,
    warnings: parser.warnings
  }

for bib in process.argv.slice(2)
  try
    parsed = importReferences(fs.readFileSync(bib, 'utf8'))
    console.log(JSON.stringify(parsed))
  catch err
    console.log(bib, err)
