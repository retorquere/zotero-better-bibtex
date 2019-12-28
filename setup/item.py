#!/usr/bin/env python3

print('Generating field mapping for CSL variables...')
import os
import urllib.request
import json

root = os.path.join(os.path.dirname(__file__), '..')

def load(url):
  with urllib.request.urlopen(url) as f:
    return json.loads(f.read().decode())

def cslmapping(schema)
    mapping = {
      'field': schema['csl']['fields']['text'],
      'creator': schema['csl']['names'],
    }
    for csl, zot in schema['csl']['fields']['date'].items():
      if not csl in mapping['field']: mapping['field'][csl] = []
      mapping['field'][csl].append(zot)

    if 'status' in mapping['field']:
      mapping['field']['status'] = [v for v in mapping['field']['status'] if v != 'legalStatus'] # that's not right according to https://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables

    for section in list(mapping.keys()):
      for name in list(mapping[section].keys()):
        if len(mapping[section][name]) == 0:
          del mapping[section][name]
  return mapping

zotero = load('https://api.zotero.org/schema')
jurism = load('https://raw.githubusercontent.com/Juris-M/zotero-schema/master/schema-jurism.json')
mixed = 

with open(os.path.join(root, 'gen', 'csl-mapping.json'), 'w') as f:
  json.dump(cslmapping(zotero), f, indent='  ')
