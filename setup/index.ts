import fs from 'fs'
import root from 'zotero-plugin/root'
process.chdir(root)

import './pug2xul'
import './preferences'
import 'zotero-plugin/copy-assets'
import 'zotero-plugin/rdf'
import 'zotero-plugin/version'
import './extract-apis'
import './bibertool'
require('./javascript-identifier-regex')
import './blinkdb'

fs.copyFileSync(require.resolve('@retorquere/bibtex-parser/unabbrev.json'), 'build/content/resource/bibtex/unabbrev.json')
fs.copyFileSync(require.resolve('@retorquere/bibtex-parser/strings.bib'), 'build/content/resource/bibtex/strings.bib')
