#!/usr/bin/env python3

import os
import json
import re
import glob

def split_and_mark(names):
  common = set(names['zotero']).intersection(names['jurism'])
  for stars, client in enumerate(['zotero', 'jurism']):
    stars = '*' * (stars + 1)
    names[client] = [field + stars for field in set(names[client]) - common]
  return sorted(names['zotero'] + names['jurism'] + list(common))

fields = {}
typeNames = {}
for client in ['zotero', 'jurism']:
  with open(glob.glob(os.path.join(os.path.dirname(__file__), '..', 'schema', f'{client}-*.json'))[0]) as f:
    schema = json.load(f)

  fields[client] = sorted(list(set(
    # capitalize fieldnames for pattern formatters
    field[0].capitalize() + field[1:]
    for itemType in schema['itemTypes']
    for fields in itemType['fields']
    #for field in fields.values()
    for field in [fields.get('baseField', fields['field'])]
  )))

  typeNames[client] = list(set(itemType['itemType'] for itemType in schema['itemTypes']))
fields = split_and_mark(fields)
typeNames = split_and_mark(typeNames)

cells = 4
fields_table = []
fields_table = [fields[i:i + cells] for i in range(0, len(fields), cells)]
fields_table[-1] = (fields_table[-1] + ([''] * cells))[0:cells]

formatter = {
  '_': {},
  '$': {},
}
jsonrpc = ''
className = None
moduleName = None

class Parameter(str):
  def __new__(cls, p):
    self = str.__new__(cls, p['name'])
    self.doc = p.get('comment', {}).get('text', None)
    return self

class Method:
  def __init__(self, signature, className):
    self.className = className
    self.name = signature['name']

    try:
      self.doc = signature['comment']['shortText']
      if 'text' in signature['comment']:
        self.doc += "\n" + signature['comment']['text']
    except KeyError:
      self.doc = 'not documented'

    self.returns = signature.get('comment', {}).get('returns', None) or signature.get('comment', {}).get('returns', None)

    self.parameters = []
    for p in signature.get('parameters', []):
      self.parameters.append(Parameter(p))

def walk(doc):
  global formatter, className, moduleName, jsonrpc

  kindString = doc.get('kindString', None)
  name = doc.get('name', '')

  if kindString == 'Method':
    signatures = doc['signatures']
    method = Method(signatures[0], className)
  else:
    method = None

  if method and moduleName == 'content/key-manager/formatter' and method.className == 'PatternFormatter':
    if len(signatures) != 1: raise ValueError('multiple sigs?')

    if (method.name[0] == '_' or method.name[0] == '$') and method.name != '$property':
      if method.name[0] == '_':
        function_or_filter = method.name[1:].replace('_', '-') # underscores in filter names are dashes in the formatter
      else:
        function_or_filter = method.name[1:].replace('_', '.') # underscores in method names are periods in the formatter
      if len(method.parameters) > 0 and method.name[0] == '$':
        if 'n' in method.parameters: function_or_filter += 'N'
        if 'n' in method.parameters and 'm' in method.parameters: function_or_filter += '_M'

      formatter[method.name[0]][function_or_filter] = method.doc

  elif method and moduleName == 'content/json-rpc' and method.className.startswith('NS'):
    if len(signatures) != 1: raise ValueError('multiple sigs?')

    params = ', '.join([p.replace('_', '\\_') for p in method.parameters])
    jsonrpc += f"## {method.className.replace('NS', '').lower()}.{method.name}({params})\n\n"
    jsonrpc += f'{method.doc}\n\n'
    for p in method.parameters:
      jsonrpc += f"* `{p}`: {p.doc}\n"

    if method.returns:
      jsonrpc += f'\n returns: {method.returns}\n'

  else:
    if kindString == 'Class':
      className = name
    elif kindString == 'Module':
      moduleName = json.loads(name)

    for child in doc.get('children', []):
      walk(child)
 
with open(os.path.join(os.path.dirname(__file__), '..', 'gen', 'type-doc.json')) as f:
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
save(jsonrpc, 'site/layouts/shortcodes/json-rpc.md')
