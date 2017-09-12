BibTeXParser = require('biblatex-csl-converter').BibLatexParser
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

console.log(JSON.stringify(importReferences(fs.readFileSync(process.argv[2], 'utf8')), null, 2))
