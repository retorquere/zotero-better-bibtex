#!/usr/bin/env python3

import json
import glob
import os
import sqlite3
import textwrap
from Cheetah.Template import Template

print('generating interfaces for serialized items')

root = os.path.join(os.path.dirname(__file__), '..')

db = sqlite3.connect(':memory:')
z = db.cursor()

query = []
for client in ['zotero', 'jurism']:
  z.execute(f'ATTACH DATABASE ? AS {client}', (os.path.join(root, f'test/fixtures/profile/{client}/{client}/{client}.sqlite'),))

  query.append(f"""
    SELECT '{client}' as client, it.typeName, COALESCE(bf.fieldName, f.fieldName) as fieldName, CASE WHEN bf.fieldName IS NULL THEN NULL ELSE f.fieldName END as fieldAlias
    FROM {client}.itemTypes it
    JOIN {client}.itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
    JOIN fields f ON f.fieldID = itf.fieldID
    LEFT JOIN {client}.baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
    LEFT JOIN {client}.fields bf ON bf.fieldID = bfmc.baseFieldID
  """)
  query.append(f"SELECT '{client}', 'note', 'note', NULL")

query = ' UNION '.join(query)
query = 'CREATE TABLE fields AS ' + query
z.execute(query)

query = 'CREATE TABLE fieldsCounted AS SELECT typeName, fieldName, fieldAlias, MIN(client) as client, COUNT(client) as clients FROM fields GROUP BY typeName, fieldName, fieldAlias'
z.execute(query)

query = """
CREATE TABLE typings AS 
  SELECT
    typeName,
    fieldName,
    fieldAlias,
    CASE when clients = 2 THEN 'both' ELSE client END AS client
  FROM fieldsCounted
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
  'websiteTitle': 'string',
  'reporter': 'string',
  'genre': 'string',
  'institution': 'string',

  'raw': 'boolean',
}

rename = {}
for (fieldName, fieldAlias) in z.execute('SELECT fieldName, fieldAlias FROM typings WHERE fieldAlias IS NOT NULL'):
  rename[fieldAlias] = fieldName
delete = [
  'collections',
  'version',
  'key',
  'citationKey',
  'libraryID',
]
for imex in ['import', 'export']:
  for fixture in glob.glob(os.path.join(root, 'test', 'fixtures', imex, '*.json')):
    if fixture.endswith('.csl.json') or fixture.endswith('.csl.juris-m.json'): continue

    with open(fixture) as f:
      lib = json.load(f)
      if not 'items' in lib: continue
      for item in lib['items']:
        for key, value in list(item.items()):
          if key in delete:
            item.pop(key, None)
            continue
          if key in rename: key = rename[key]

          if key == 'itemID' and type(value) in [str, int]:
            tpe = 'string | number'
          elif type(value) is str:
            tpe = 'string'
          elif type(value) is int:
            tpe = 'number'
          elif key == 'creators' and type(value) is list:
            tpe = '{ creatorType?: string, name?: string, firstName?: string, lastName?:string, fieldMode?: number }[]'
          elif key == 'notes' and type(value) is list:
            tpe = 'string[]'
          elif key == 'tags' and type(value) is list:
            tpe = 'Array<{ tag: string, type?: number }>'
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

with open(os.path.join(root, 'gen/typings/serialized-item.d.ts'), 'w') as typings:
  print(f'  {os.path.relpath(typings.name, root)}')
  def add(s): print(textwrap.indent(s, '  '), file=typings)
  def comment(s): print(textwrap.indent(textwrap.fill(s, width=100, initial_indent='', subsequent_indent='  '), '  // '), file=typings)
  def addfield(name, tpe='any'): add(f'{name}: {types.pop(name, tpe)}')

  print('interface ISerializedItem {', file=typings)

  comment('fields common to all items')
  for fieldName in 'itemID itemType dateAdded dateModified creators tags notes attachments raw'.split(' '):
    addfield(fieldName)
  print('', file=typings)

  #comment("exists note")
  #addfield('note')
  #print('', file=typings)

  for (fieldName,) in list(z.execute('SELECT DISTINCT fieldName FROM typings ORDER BY LOWER(fieldName)')):
    typeNames = []
    for (client, typeName) in z.execute('SELECT DISTINCT client, typeName FROM typings WHERE fieldName = ? ORDER BY typeName', [fieldName]):
      if client != 'both': typeName = f'{client}.{typeName}'
      typeNames.append(typeName)
    comment(f'exists on {", ".join(typeNames)}')

    aliases = []
    for (client, typeName, fieldAlias) in z.execute('SELECT DISTINCT client, typeName, fieldAlias FROM typings WHERE fieldName = ? AND fieldAlias IS NOT NULL ORDER BY typeName', [fieldName]):
      fieldAlias = f'{typeName}.{fieldAlias}'
      if client != 'both': fieldAlias = f'{client}.{fieldAlias}'
      aliases.append(fieldAlias)
    if len(aliases) > 0: comment(f'also known as {", ".join(aliases)}')

    addfield(fieldName)
    print('', file=typings)

  for fieldName in 'uri referenceType cslType cslVolumeTitle citekey'.split(' '):
    addfield(fieldName, 'string')
  addfield('collections', 'string[]')

  addfield('extraFields', textwrap.dedent('''
    {
      csl: { [key: string]: { name: string, type: string, value: any } }
      tex: { [key: string]: { name: string, type: string, value: string, raw?: boolean, bibtex?: string } }
      citekey?: { aliases: string[] }
    }
  ''').strip())
  addfield('arXiv', '{ source?: string, id: string, category?: string }')

  comment('Juris-M extras')
  addfield('multi')

  print('}', file=typings)

if len(types) != 0: raise ValueError(', '.join(types.keys()))

###################### simplify

# this REQUIRES the aliases to be sorted on field
template = """
// tslint:disable:one-line

declare const Zotero: any

const jurism = Zotero.Utilities.getVersion().includes('m')
const zotero = !jurism

export const valid = new Map([
  #for $typeName, $fields in $validFields.items()
  ['$typeName', new Map([
    #for $field, $valid in $fields.items()
      ['$field', $valid],
    #end for
    ]),
  ],
  #end for
])

function unalias(item) {
#set $current = None
#for $client, $field, $alias in $aliases
  #if $field != $current
    #if $current is not None

    #end if
  // $field
    #set $else_ = ''
  #else
    #set $else_ = 'else '
  #end if
  #if $client != 'both'
    #set $client_ = $client + ' && '
  #else
    #set $client_ = ''
  #end if
  ${else_}if (${client_}typeof item.$alias !== 'undefined') { item.$field = item.$alias; delete item.$alias }
  #set $current = $field
#end for
}

// import & export translators expect different creator formats... nice

export function simplifyForExport(item, dropAttachments = false) {
  unalias(item)

  item.notes = item.notes ? item.notes.map(note =>  note.note || note ) : []
  if (item.filingDate) item.filingDate = item.filingDate.replace(/^0000-00-00 /, '')

  if (item.creators) {
    for (const creator of item.creators) {
      if (creator.fieldMode) {
        creator.name = creator.name || creator.lastName
        delete creator.lastName
        delete creator.firstName
        delete creator.fieldMode
      }
    }
  }

  if (dropAttachments) item.attachments = []

  return item
}

export function simplifyForImport(item) {
  unalias(item)

  if (item.creators) {
    for (const creator of item.creators) {
      if (creator.name) {
        creator.lastName = creator.lastName || creator.name
        creator.fieldMode = 1
        delete creator.firstName
        delete creator.name
      }
      if (!jurism) delete creator.multi
    }
  }

  if (!jurism) delete item.multi

  return item
}
"""

with open(os.path.join(root, 'gen/itemfields.ts'), 'w') as simplify:
  print(f'  {os.path.relpath(simplify.name, root)}')
  validFields = {}

  for (client, typeName, fieldName) in z.execute('SELECT DISTINCT client, typeName, fieldName FROM typings ORDER BY fieldName'):
    if not typeName in validFields:
      if typeName == 'note':
        validFields[typeName] = {field: 'true' for field in 'itemType tags note id itemID dateAdded dateModified'.split(' ')}
      else:
        validFields[typeName] = {field: 'true' for field in 'itemType creators tags attachments notes seeAlso id itemID dateAdded dateModified multi'.split(' ')}

    if client == 'both':
      validFields[typeName][fieldName] = 'true'
    else:
      validFields[typeName][fieldName] = client

  simplify.write(str(Template(template, searchList=[{
    'aliases': z.execute('SELECT DISTINCT client, fieldName, fieldAlias FROM typings WHERE fieldAlias IS NOT NULL ORDER BY fieldName, fieldAlias'),
    'validFields': validFields,
    'generator': os.path.basename(__file__) }
  ])))

