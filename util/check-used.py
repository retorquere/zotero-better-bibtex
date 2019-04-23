#!/usr/bin/env python3

import glob
import json
import sys
import os

used = []
for _used in glob.glob('gen/log-used/*.json'):
  with open(_used) as f:
    used = used + json.load(f)
used = [_used for _used in set(used) if not _used.startswith('gen/')]
#print(used)

sources = []
for root in ['content', 'translators']:
  for (dirpath, dirnames, filenames) in os.walk(root):
    if dirpath == 'content/minitests':
      continue
    sources += [os.path.join(dirpath, filename) for filename in filenames if not filename.endswith('.xul')]

unused = [src for src in sources if not src in used]

for src in unused:
  print(f'Not used: {src}')
sys.exit(len(unused))
