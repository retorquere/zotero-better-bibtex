#!/usr/bin/env python3

import sqlite3
import os
import json
import re
from ruamel.yaml import YAML
yaml=YAML()
yaml.default_flow_style = False

profile = sqlite3.connect('test/fixtures/profile/zotero/zotero/zotero.sqlite')
profile.row_factory = sqlite3.Row
# fetch fieldnames and capitalize them
query = '''
  SELECT DISTINCT COALESCE(bf.fieldName, f.fieldName) as fieldName
  FROM itemTypes it
  JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
  JOIN fields f ON f.fieldID = itf.fieldID
  LEFT JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
  LEFT JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
'''
fields = sorted([row['fieldName'].capitalize() for row in profile.execute(query)])

typeNames = [row['typeName'] for row in profile.execute('SELECT DISTINCT typeName FROM itemTypes ORDER BY typeName')]

cells = 4
table = []
table = [fields[i:i + cells] for i in range(0, len(fields), cells)]
table[-1] = (table[-1] + ([''] * cells))[0:cells]

formatter = {
  '_': {},
  '$': {},
}
def walk(doc):
  global formatter

  if doc.get('kindString', None) == 'Method':
    doc_name = doc.get('name', '')
    if (doc_name[0] == '_' or doc_name[0] == '$') and doc_name != '$property':
      signatures = doc['signatures']
      if len(signatures) != 1: raise ValueError('multiple sigs?')

      name = doc_name[1:].replace('_', '.') # underscores in method names are periods in the formatter
      if signatures[0].get('parameters', False) and doc_name[0] == '$':
        parameters = [p['name'] for p in signatures[0]['parameters']]
        if 'n' in parameters: name += 'N'
        if 'n' in parameters and 'm' in parameters: name += '_M'

      try:
        documentation = signatures[0]['comment']['shortText']
      except KeyError:
        documentation = 'not documented'

      formatter[doc_name[0]][name] = documentation

  else:
    for child in doc.get('children', []):
      walk(child)
 
with open(os.path.join(os.path.dirname(__file__), '..', 'typedoc.json')) as f:
  walk(json.load(f))

def quote(s):
  return f'`{s}`'

for func in list(formatter['$'].keys()):
  if func.startswith('authors'):
    name = ' / '.join([quote(f) for f in [func, func.replace('authors', 'editors')]])
  elif func.startswith('author'):
    name = ' / '.join([quote(f) for f in [func, func.replace('author', 'editor')]])
  elif func.startswith('auth'):
    name = ' / '.join([quote(f) for f in [func, func.replace('auth', 'edtr')]])
  else:
    name = quote(func)

  formatter['$'][name] = formatter['$'][func]
  del formatter['$'][func]

for filt in list(formatter['_'].keys()):
  formatter['_'][quote(filt)] = formatter['_'][filt]
  del formatter['_'][filt]

with open('docs/_data/pattern/fields.yml', 'w') as f:
  yaml.dump(table, f)
with open('docs/_data/pattern/typeNames.yml', 'w') as f:
  yaml.dump(typeNames, f)
with open('docs/_data/pattern/functions.yml', 'w') as f:
  yaml.dump(formatter['$'], f)
with open('docs/_data/pattern/filters.yml', 'w') as f:
  yaml.dump(formatter['_'], f)
