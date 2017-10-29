// tslint:disable:no-console

const bibtexParser = require('biblatex-csl-converter').BibLatexParser
// BibTeXParser = require('../../biblatex-csl-converter').BibLatexParser
import fs = require('fs')

function importReferences(input) {
  const parser = new bibtexParser(input, {
    rawFields: true,
    processUnexpected: true,
    processUnknown: {
      comment: 'f_verbatim',
    },
  })

  /* this must be called before requesting warnings or errors -- this really, really weirds me out */
  const references = parser.output

  /* relies on side effect of calling '.output' */
  return {
    references,
    groups: parser.groups,
    errors: parser.errors,
    warnings: parser.warnings,
  }
}

for (const bib of process.argv.slice(2)) {
  try {
    const parsed = importReferences(fs.readFileSync(bib, 'utf8'))
    console.log(JSON.stringify(parsed, null, 2))
  } catch (err) {
    console.log(bib, err)
  }
}
