#!/usr/bin/env python3

import makedirs
import translators
import submodules
import months
import kuroshiro
import item
# import jieba
import babel_languages
import scannablecite
import manifest
import ftl2dtd
import unicode

import shutil
with open('submodules/zotero/chrome/content/zotero/osfile.mjs') as i, open('gen/osfile.js', 'w') as o:
  o.write(''.join([line for line in i.readlines() if 'Cu.reportError' not in line]))
