#!/usr/bin/env python3

import json
import os
import glob
from addict import Dict
import re

print('translators')

root = os.path.join(os.path.dirname(__file__), '..')

translators = Dict()
variables = Dict()

def jstype(v):
  if type(v) == bool: return 'boolean'
  if type(v) == str: return 'string'
  if type(v) == int: return 'number'
  raise ValueError(f'Unexpected type {type(v)}')

for header in sorted(glob.glob(os.path.join(root, 'translators/*.json'))):
  with open(header) as f:
    header = Dict(json.load(f))
    print(f'  {header.label}')

    translators.byId[header.translatorID] = header
    translators.byName[header.label] = header
    translators.byLabel[re.sub(r'[^a-zA-Z]', '', header.label)] = header

    for key, value in header.items():
      if key == 'displayOptions':
        for option, default in value.items():
          variables.displayOptions[option] = jstype(default)

      elif key == 'configOptions':
        for option, default in value.items():
          variables.configOptions[option] = jstype(default)

      else:
        variables.header[key] = jstype(value)

with open(os.path.join(root, 'gen/translators.json'), 'w') as out:
  json.dump(translators, out, indent=2, sort_keys=True)
