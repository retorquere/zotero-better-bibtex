#!/usr/bin/env python3

import json
import sys
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('-c', '--config', action='store_true')
parser.add_argument('-u', '--unique', action='store_true')
parser.add_argument('libraries', type=str, nargs='+')
args = parser.parse_args()

main = args.libraries.pop(0)

with open(main) as f:
  data = json.load(f)

jurisM = main.endswith('.juris-m.json')

for lib in args.libraries:
  if lib.endswith('.schomd.json'): continue
  if lib.endswith('.csl.json') or lib.endswith('.csl.juris-m.json'): continue
  if not jurisM and lib.endswith('.jurism.json'): continue
  print(lib)

  with open(lib) as f:
    lib = json.load(f)

  if args.config and 'config' in lib:
    data['config'] = lib['config']

  if 'items' in lib:
    data['items'] = data['items'] + lib['items']

if args.unique:
  data['items'] = [json.loads(item) for item in set([json.dumps(item, sort_keys=True) for item in data['items']])]

print(len(data['items']))

print('saving', main)
with open(main, 'w') as f:
  json.dump(data, f, indent='  ')

with open(main) as f:
  data = json.load(f)
  print(len(data['items']))

