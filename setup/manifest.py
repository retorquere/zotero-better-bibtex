#!/usr/bin/env python3

import json
import re
from compact_json import Formatter, EolStyle

formatter = Formatter()
formatter.indent_spaces = 2
formatter.max_inline_complexity = 10
formatter.json_eol_style = EolStyle.LF

manifest = []
with open('chrome.manifest') as f:
  for line in f.readlines():
    line = re.sub(r'#.*', '', line.strip())
    if line == '': continue
    line = re.split(r'\s+', line)
    if line[0] in ['content', 'locale']:
      manifest.append(line)
with open('gen/chrome.json', 'w') as f:
  f.write(formatter.serialize(manifest))
