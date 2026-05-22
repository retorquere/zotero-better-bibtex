#!/usr/bin/env python3

from mako.template import Template

with open('submodules/zotero-odf-scan-plugin/resource/translators/Scannable Cite.js') as f:
  src = f.read().splitlines()
  src = [line for line in src if not 'let library_id' in line]
  src = '\n'.join(src)

with open('gen/ScannableCite.ts', 'w') as f:
  f.write(Template(filename='setup/templates/Scannable Cite.mako').render(src=src))
