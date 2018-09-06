#!/usr/bin/env python3

import json
import glob
import os
import sqlite3
import textwrap

root = os.path.join(os.path.dirname(__file__), '..')

db = sqlite3.connect(os.path.join(root, 'test/fixtures/profile/zotero/zotero/zotero.sqlite'))
z = db.cursor()

query = """
  CREATE TEMPORARY TABLE typings
  
  AS

  SELECT it.typeName, COALESCE(bf.fieldName, f.fieldName) as fieldName, CASE WHEN bf.fieldName IS NULL THEN NULL ELSE f.fieldName END as fieldAlias
  FROM itemTypes it
  JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
  JOIN fields f ON f.fieldID = itf.fieldID
  LEFT JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
  LEFT JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
  ORDER BY 2, 1, 3
"""
z.execute(query)

types = {
  'applicationNumber': 'string',
  'artworkSize': 'string',
  'assignee': 'string',
  'codeNumber': 'string',
  'committee': 'string',
  'filingDate': 'string',
  'history': 'string',
  'issuingAuthority': 'string',
  'legalStatus': 'string',
  'legislativeBody': 'string',
  'meetingName': 'string',
  'priorityNumbers': 'string',
  'programmingLanguage': 'string',
  'references': 'string',
  'scale': 'string',
  'seriesText': 'string',
  'session': 'string',
  'system': 'string',
  'versionNumber': 'string',
}

rename = {}
for (fieldName, fieldAlias) in z.execute('SELECT fieldName, fieldAlias FROM typings WHERE fieldAlias IS NOT NULL'):
  rename[fieldAlias] = fieldName
for imex in ['import', 'export']:
  for fixture in glob.glob(os.path.join(root, 'test', 'fixtures', imex, '*.json')):
    if fixture.endswith('.csl.json') or fixture.endswith('.csl.juris-m.json'): continue

    with open(fixture) as f:
      lib = json.load(f)
      if not 'items' in lib: continue
      for item in lib['items']:
        for key, value in item.items():
          if key in rename: key = rename[key]

          if key == 'itemID' and type(value) in [str, int]:
            tpe = 'string | number'
          elif type(value) is str:
            tpe = 'string'
          elif type(value) is int:
            tpe = 'number'
          elif key == 'creators' and type(value) is list:
            tpe = '{ creatorType?: string, name?: string, firstName?: string, lastName?:string, fieldMode?: number }[]'
          elif key in ['notes', 'tags'] and type(value) is list:
            tpe = 'string[]'
          elif key == 'multi' and type(value) is dict:
            tpe = 'any'
          elif key in ['seeAlso', 'relations'] and type(value) is list:
            continue
          elif key == 'attachments' and type(value) is list:
            tpe = '{ path: string, title?: string, mimeType?: string }'
          else:
            raise ValueError(f'{fixture}.{key}: {type(value)}')

          if not key in types:
            types[key] = tpe
          elif types[key] != tpe:
            raise ValueError(f'{fixture}.{key}: {types[key]} vs {tpe}')


with open(os.path.join(root, 'translators/typings/serialized-item.d.ts'), 'w') as typings:
  def add(s): print(textwrap.indent(s, '  '), file=typings)
  def addfield(name, tpe='any'): add(f'{name}: {types.pop(name, tpe)}')

  print('interface ISerializedItem {', file=typings)

  for fieldName in 'itemID itemType dateAdded dateModified creators tags notes attachments'.split(' '):
    addfield(fieldName)

  add("// exists only on 'note' items")
  addfield('note')

  for (fieldName,) in list(z.execute('SELECT distinct fieldName FROM typings ORDER BY LOWER(fieldName)')):
    typeNames = [typeName for (typeName,) in list(z.execute('SELECT typeName FROM typings WHERE fieldName = ? ORDER BY typeName', [fieldName]))]
    add(f'// exists on {", ".join(typeNames)}')

    aliases = [f'{typeName}.{fieldAlias}'
               for (typeName, fieldAlias)
               in list(z.execute('SELECT typeName, fieldAlias FROM typings WHERE fieldName = ? AND fieldAlias IS NOT NULL ORDER BY typeName', [fieldName]))
              ]
    if len(aliases) > 0: add(f'// also known as {", ".join(aliases)}')

    addfield(fieldName)
    print('', file=typings)

  for fieldName in 'uri referenceType cslType cslVolumeTitle citekey'.split(' '):
    addfield(fieldName, 'string')
  addfield('collections', 'string[]')

  addfield('extraFields', textwrap.dedent('''
    {
      bibtex: { [key: string]: { name: string, type: string, value: any } }
      csl: { [key: string]: { name: string, type: string, value: any } }
      kv: { [key: string]: { name: string, type: string, value: string, raw?: boolean } }
    }
  ''').strip())
  addfield('arXiv', '{ eprint: string, source?: string, id: string, primaryClass?: string }')

  add('// Juris-M extras')
  addfield('multi')

  print('}', file=typings)

if len(types) != 0: raise ValueError(', '.join(types.keys()))
