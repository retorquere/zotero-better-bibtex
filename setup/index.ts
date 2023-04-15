import fs from 'fs'
import root from 'zotero-plugin/root'
process.chdir(root)

import './preferences'
import 'zotero-plugin/copy-assets'
import 'zotero-plugin/rdf'
import 'zotero-plugin/version'
import './extract-apis'
import './bibertool'
require('./javascript-identifier-regex')

fs.copyFileSync(require.resolve('@retorquere/bibtex-parser/unabbrev.json'), 'build/resource/bibtex/unabbrev.json')
fs.copyFileSync(require.resolve('@retorquere/bibtex-parser/strings.bib'), 'build/resource/bibtex/strings.bib')
