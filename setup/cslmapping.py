#!/usr/bin/env python3

print('Generating field mapping for CSL variables...')
import os
import urllib.request
import json

root = os.path.join(os.path.dirname(__file__), '..')

# https://raw.githubusercontent.com/Juris-M/zotero-schema/master/schema-jurism.json
with urllib.request.urlopen('https://api.zotero.org/schema') as f:
  data = json.loads(f.read().decode())
  mapping = {
    'field': data['csl']['fields']['text'],
    'creator': data['csl']['names'],
  }
  for csl, zot in data['csl']['fields']['date'].items():
    if not csl in mapping['field']: mapping['field'][csl] = []
    mapping['field'][csl].append(zot)

  if 'status' in mapping['field']:
    mapping['field']['status'] = [v for v in mapping['field']['status'] if v != 'legalStatus'] # that's not right according to https://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables

  for section in list(mapping.keys()):
    for name in list(mapping[section].keys()):
      if len(mapping[section][name]) == 0:
        del mapping[section][name]

with open(os.path.join(root, 'gen', 'csl-mapping.json'), 'w') as f:
  json.dump(mapping, f, indent='  ')
