#!/usr/bin/env node

import fs from 'fs'
import { fileURLToPath } from 'url'

import './pug2xul.js'
import './preferences.js'
import 'zotero-plugin/copy-assets.js'
import 'zotero-plugin/manifest.js'
import 'zotero-plugin/version.js'
import './bibertool.js'
import './apis.js'

function resolve(path) {
  return fileURLToPath(import.meta.resolve(path))
}

fs.copyFileSync('node_modules/@retorquere/bibtex-parser/dist/data/unabbrev.json', 'build/content/resource/bibtex/unabbrev.json')
fs.copyFileSync('node_modules/@retorquere/bibtex-parser/dist/data/strings.bib', 'build/content/resource/bibtex/strings.bib')
const manifest = JSON.parse(fs.readFileSync('build/manifest.json', 'utf-8'))
manifest.applications.zotero.strict_min_version = '7.0.15'
manifest.applications.zotero.strict_max_version = '8.*'
fs.writeFileSync('build/manifest.json', JSON.stringify(manifest, null, 2))
