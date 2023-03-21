#!/usr/bin/env python3

import os
import json
import re
import glob

def split_and_mark(names):
  common = set(names['zotero']).intersection(names['jurism'])
  for client, marker in {'zotero': 'Z', 'jurism': 'JM'}.items():
    names[client] = [field + f'<sup>{marker}</sup>' for field in set(names[client]) - common]
  return sorted(names['zotero'] + names['jurism'] + list(common))

fieldLabels = {}
fieldNames = {}
typeNames = {}
for client in ['zotero', 'jurism']:
  with open(os.path.join(os.path.dirname(__file__), '..', 'schema', f'{client}.json')) as f:
    schema = json.load(f)

  fieldNames[client] = sorted(list(set(
    # capitalize fieldnames for pattern formatters
    field
    for itemType in schema['itemTypes']
    for fields in itemType['fields']
    for field in [fields['field'], fields.get('baseField', fields['field'])]
    if field not in ['extra', 'citationKey']
  )))

  fieldLabels[client] = [ field[0].capitalize() + field[1:] for field in fieldNames[client] ]

  typeNames[client] = list(set(itemType['itemType'] for itemType in schema['itemTypes']))

fieldLabels = split_and_mark(fieldLabels)
fieldNames = split_and_mark(fieldNames)
typeNames = split_and_mark(typeNames)

def make_table(data):
  cells = 4
  table = []
  table = [data[i:i + cells] for i in range(0, len(data), cells)]
  table[-1] = (table[-1] + ([''] * cells))[0:cells]
  return table

print('Saving pattern formatters documentation')
def save(data, path):
  os.makedirs(os.path.dirname(path), exist_ok=True)
  print('  ' + path)
  with open(path, 'w') as f:
    if path.endswith('.json'):
      json.dump(data, f, indent=2)
    else:
      f.write(data)

save(make_table(fieldLabels), 'site/data/citekeyformatters/fields.json')
save(make_table(fieldNames), 'site/data/postscript/fields.json')
save(make_table(typeNames), 'site/data/postscript/itemTypes.json')
