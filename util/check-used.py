#!/usr/bin/env python

import glob
import json

used = []
for _used in glob.glob('gen/log-used/*.json'):
  with open(_used) as f:
    used = used + json.load(f)
used = [_used for _used in set(used) if not _used.startswith('gen/')]
#print(used)

for src in glob.glob(r'[content]/**/*.[ts]'):
  print(src)

sources = [
    f
    for d in ['content', 'translators']
    for e in ['ts', 'json']
    for f in glob.glob(f'{d}/**/*.{e}')
    if not f.endswith('.d.ts') and not f.startswith('content/minitests/')
]

for src in sources:
  if not src in used: print(src)
