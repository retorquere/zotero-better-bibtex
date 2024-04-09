#!/usr/bin/env python3

import makedirs
import translators
import submodules
import months
import kuroshiro
import item
import jieba
import babel_languages
import scannablecite
import manifest
import ftl2dtd
import unicode

with open('submodules/zotero/chrome/content/zotero/osfile.mjs') as src, open('gen/osfile-shim.js', 'w') as tgt:
  tgt.write(src.read().replace('export let OS =', 'export let $OS ='))
