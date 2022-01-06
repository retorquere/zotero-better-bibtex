#!/usr/bin/env python3

from mako.template import Template

with open('submodules/zotero-odf-scan-plugin/resource/translators/Scannable Cite.js') as f:
  src = f.read()

with open('gen/ScannableCite.ts', 'w') as f:
  f.write(Template(filename='setup/templates/Scannable Cite.mako').render(src=src))
