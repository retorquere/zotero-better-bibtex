#!/usr/bin/env python3

import json
import sys

main = sys.argv[1]

with open(main) as f:
  data = json.load(f)

jurisM = main.endswith('.juris-m.json')

for add in sys.argv[2:]:
  print(add)
  if add.endswith('.schomd.json'): continue
  if add.endswith('.csl.json') or add.endswith('.csl.juris-m.json'): continue
  if not jurisM and add.endswith('.jurism.json'): continue

  with open(add) as f:
    d = json.load(f)

  if not 'items' in d: continue


  data['items'] = data['items'] + d['items']

print(len(data['items']))

with open(main, 'w') as f:
  json.dump(data, f, indent='  ')
