import root from '../zotero-webpack/root'
process.chdir(root)

import './submodules'

import '../zotero-webpack/make-dirs'
import './translators'
import './dateparser'
import './preferences'
import './translator-typing'

import '../zotero-webpack/copy-assets'
import '../zotero-webpack/rdf'
import '../zotero-webpack/version'
