#!/usr/bin/env python3

import json
import re

manifest = []
with open('chrome.manifest') as f:
  for line in f.readlines():
    line = re.sub(r'#.*', '', line.strip())
    if line == '': continue
    line = re.split(r'\s+', line)
    if line[0] in ['content', 'locale']:
      manifest.append(line)
with open('chrome.json', 'w') as f:
  json.dump(manifest, f, indent='  ')
