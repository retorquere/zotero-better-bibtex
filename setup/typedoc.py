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

fields = {}
typeNames = {}
for client in ['zotero', 'jurism']:
  with open(os.path.join(os.path.dirname(__file__), '..', 'schema', f'{client}.json')) as f:
    schema = json.load(f)

  fields[client] = sorted(list(set(
    # capitalize fieldnames for pattern formatters
    field[0].capitalize() + field[1:]
    for itemType in schema['itemTypes']
    for fields in itemType['fields']
    #for field in fields.values()
    for field in [fields['field'], fields.get('baseField', fields['field'])]
    if field != 'extra'
  )))

  typeNames[client] = list(set(itemType['itemType'] for itemType in schema['itemTypes']))
fields = split_and_mark(fields)
typeNames = split_and_mark(typeNames)

cells = 4
fields_table = []
fields_table = [fields[i:i + cells] for i in range(0, len(fields), cells)]
fields_table[-1] = (fields_table[-1] + ([''] * cells))[0:cells]

print('Saving pattern formatters documentation')
def save(data, path):
  os.makedirs(os.path.dirname(path), exist_ok=True)
  print('  ' + path)
  with open(path, 'w') as f:
    if path.endswith('.json'):
      json.dump(data, f, indent=2)
    else:
      f.write(data)

save(fields_table, 'site/data/citekeyformatters/fields.json')
save(typeNames, 'site/data/citekeyformatters/typeNames.json')
