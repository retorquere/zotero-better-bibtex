#!/usr/bin/env python3

import os, sys
import json

ref, output = sys.argv[1:]
if not ref.startswith('refs/heads/'):
  print(ref, 'is not a branch')
  sys.exit(0)
branch = ref.split('/')[-1]

print('loaded', branch, '=>', output)

loaded = []
for job in [1, 2]:
  job = f'logs/loaded-zotero-{job}-{branch}.json'
  if not os.path.exists(job):
    print('not found:', job)
    sys.exit(0)
  loaded += json.load(job)

with open(output, 'w') as f:
  json.dump(sorted(loaded), f, indent='  ')
print(f"::set-output name=loaded::{output}")
