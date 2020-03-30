#!/usr/bin/env python3

import os, sys
import urllib.request
import json
from munch import Munch, DefaultMunch
import copy
import re
import sqlite3

root = os.path.join(os.path.dirname(__file__), '..')

def load(url):
  with urllib.request.urlopen(url) as f:
    return json.loads(f.read().decode())

data = DefaultMunch.fromDict({
  'zotero': load('https://api.zotero.org/schema'),
  'jurism': load('https://raw.githubusercontent.com/Juris-M/zotero-schema/master/schema-jurism.json')
}, None)

class ExtraFields:
  def __init__(self):
    self.db = sqlite3.connect(':memory:', isolation_level=None)
    self.db.row_factory = lambda cursor, row: Munch.fromDict({ col[0]: row[idx] for idx, col in enumerate(cursor.description) })
    self.db.execute('CREATE TABLE zotero (zotero PRIMARY KEY, format NOT NULL)')
    self.db.execute('CREATE TABLE csl (csl NOT NULL, zotero NOT NULL, format NOT NULL, PRIMARY KEY(csl, zotero))')
    self.db.execute('CREATE TABLE label (label PRIMARY KEY, zotero NOT NULL)')
    self.zotero = set()
    self.csl = set()

  def uncamelcase(self, k):
    if re.match(r'[a-z]+([A-Z][a-z]+)+$', k):
      return re.sub('([A-Z])', r' \1', k, flags=re.DOTALL)
    else:
      return k

  def label(self, label, field, mode='REPLACE'):
    if label == 'Conf. Date': label = 'Conference Date'
    label = label.replace('Supp. ', 'Supplement ')
    label = label.replace('Resol. ', 'Resolution ')
    label = label.replace('Orig. ', 'Original ')
    label = label.replace('Assy. ', 'Assembly ')
    label = label.replace('Loc. ', 'Location ')
    label = label.replace('# of ', 'Number of ')
    if label.endswith(' No.'): label = label.replace(' No.', ' Number')
    if label.endswith(' Vol.'): label = label.replace(' Vol.', ' Volume')

    assert '.' not in label, str([label, field])
    assert '#' not in label, str([label, field])
    self.db.execute(f'INSERT OR {mode} INTO label (label, zotero) VALUES (LOWER(?), ?)', (label, field))

  def types(self, types, msg):
    types = set(types)
    if len(types) == 0:
      return [ 'text ']
    if len(types) > 1:
      types = set(types) - set(['text'])
    assert len(types) == 1, str((msg, types))
    return list(types)

  def load(self, data):
    locale = data.locales['en-US']
    # this must be an error
    locale.fields.programmingLanguage = 'Programming Language'

    # fields
    basefield = {}
    for itemType in data.itemTypes:
      for field in itemType.fields:
        self.db.execute('INSERT OR IGNORE INTO zotero (zotero, format) VALUES (?, ?)', (field.get('baseField', field.field), 'text'))
        self.label(self.uncamelcase(field.field), field.get('baseField', field.field), 'IGNORE')

        if 'baseField' in field:
          self.zotero.add(field.baseField)
          basefield[field.field] = field.baseField
          self.label(self.uncamelcase(field.baseField), field.baseField, 'IGNORE')
        
      for field in itemType.creatorTypes:
        self.db.execute('INSERT OR REPLACE INTO zotero (zotero, format) VALUES (?, ?)', (field.creatorType, 'creator'))
        self.label(self.uncamelcase(field.creatorType), field.creatorType, 'IGNORE')

    # field types
    for field, meta in data.meta.fields.items():
      self.db.execute('INSERT OR REPLACE INTO zotero (zotero, format) VALUES (?, ?)', (field, meta.type))
      self.label(self.uncamelcase(field), basefield.get(field, field), 'IGNORE')

    # labels
    for zotero_field, label in locale.fields.items():
      self.zotero.add(basefield.get(zotero_field, zotero_field))
      self.label(label, basefield.get(zotero_field, zotero_field))
    for zotero_field, label in locale.creatorTypes.items(): # don't register type?
      self.zotero.add(basefield.get(zotero_field, zotero_field))
      self.label(label, basefield.get(zotero_field, zotero_field))

#    for csl_type, zotero_types in data.csl.types.items():
#      zotero_types = [t for t in zotero_types if t not in ['attachment', 'note']]
#      mapping[f'type.{csl_type}'] = { 'type': zotero_types[0] }
#      for t in zotero_types:
#        mapping[f'type.{t}'] = { 'type': t }

    # CSL
    for csl_field, zotero_fields in data.csl.fields.text.items():
      self.csl.add(csl_field)
      for f in zotero_fields:
        self.db.execute('INSERT OR IGNORE INTO csl (csl, zotero, format) VALUES (?, ?, ?)', (csl_field, basefield.get(f, f), 'text'))
      
    for csl_field, zotero_field in data.csl.fields.date.items():
      self.csl.add(csl_field)
      zotero_field = basefield.get(zotero_field, zotero_field)
      self.db.execute('INSERT OR REPLACE INTO csl (csl, zotero, format) VALUES (?, ?, ?)', (csl_field, zotero_field, 'date'))

    for zotero_field, csl_field in data.csl.names.items():
      self.csl.add(csl_field)
      zotero_field = basefield.get(zotero_field, zotero_field)

      self.db.execute('INSERT OR REPLACE INTO csl (csl, zotero, format) VALUES (?, ?, ?)', (csl_field, zotero_field, 'creator'))

    # missing matching for e.g. volume-title
    with open(os.path.join(root, 'setup', 'csl-vars.json')) as f:
      for csl_field, csl_format in json.load(f).items():
        candidate = re.sub(r'([a-z])[-_]([a-z])', lambda match: match.group(1) + match.group(2).upper(), csl_field, flags=re.DOTALL)
        candidate = basefield.get(candidate, candidate)
        self.db.execute('INSERT OR IGNORE INTO csl (csl, zotero, format) SELECT ?, ?, ? WHERE EXISTS(SELECT 1 FROM zotero WHERE zotero = ?)', (csl_field, candidate, csl_format, candidate))

  def save(self, output):
    data = {}
    for row in self.db.execute('SELECT zotero FROM zotero WHERE zotero NOT IN (SELECT zotero FROM label)'):
      print('!', row.zotero)

    for row in self.db.execute('''
      SELECT label.label, GROUP_CONCAT(label.zotero) AS zotero, COALESCE(GROUP_CONCAT(csl.csl), '') AS csl
      FROM label
      LEFT JOIN csl ON label.zotero = csl.zotero
      GROUP BY label.label
    '''):
      data[row.label] = {}
      types = []

      # soundex = Soundex()
      if row.zotero != '':
        data[row.label]['zotero'] = sorted(list(set(row.zotero.split(',')))) #, key=lambda x: soundex.compare(row.label, x))

        data[row.label]['id'] = list(self.zotero.intersection(set(data[row.label]['zotero'])))[0]
        #data[row.label]['zotero'][0]

        types += [ ft.format for f in data[row.label]['zotero'] for ft in self.db.execute('SELECT DISTINCT format FROM zotero WHERE zotero = ?', (f,)) ]

      if row.csl != '':
        data[row.label]['csl'] = sorted(list(set(row.csl.split(',')))) # , key=lambda x: soundex.compare(row.label, x))
        if not 'id' in data[row.label]:
          data[row.label]['id'] = list(self.csl.intersection(set(data[row.label]['csl'])))[0]
          #data[row.label]['id'] = data[row.label]['csl'][0]
        types += [ ft.format for f in data[row.label]['csl'] for ft in self.db.execute('SELECT DISTINCT format FROM csl WHERE csl = ?', (f,)) ]
      data[row.label]['type'] = self.types(types, row.label)[0]

    with open(os.path.join(root, 'setup', 'csl-vars.json')) as f:
      csl_vars = json.load(f)
    for row in self.db.execute("SELECT LOWER(csl) AS label, csl, COALESCE(GROUP_CONCAT(zotero), '') AS zotero FROM csl GROUP BY csl"):
      data[row.label] = { 'csl': [ row.csl ] }
      csl_vars.pop(row.csl, None)
      types = [ ft.format for ft in self.db.execute('SELECT DISTINCT format FROM csl WHERE LOWER(csl) = LOWER(?)', (row.csl,)) ]
      if row.zotero != '':
        data[row.label]['zotero'] = sorted(list(set(row.zotero.split(',')))) # , key=lambda x: soundex.compare(row.label, x))
        types += [ ft.format for f in data[row.label]['zotero'] for ft in self.db.execute('SELECT DISTINCT format FROM zotero WHERE zotero = ?', (f,)) ]
        #data[row.label]['id'] = data[row.label]['zotero'][0]
        data[row.label]['id'] = list(self.zotero.intersection(set(data[row.label]['zotero'])))[0]
      else:
        #data[row.label]['id'] = data[row.label]['csl'][0]
        data[row.label]['id'] = list(self.csl.intersection(set(data[row.label]['csl'])))[0]
        
      data[row.label]['type'] = self.types(types, row.csl)[0]

    # why are these missing?
    for csl_field, csl_format in csl_vars.items():
      if csl_field[0] == '.': continue

      csl_field_lower = csl_field.lower()

      if csl_field_lower in data:
        if not 'csl' in data[csl_field_lower]:
          data[csl_field_lower]['csl'] = [ csl_field ]
        elif not csl_field_lower in data[csl_field_lower]['csl']:
          data[csl_field_lower]['csl'].append(csl_field)
        else:
          continue
        data[csl_field_lower]['csl'] = sorted(data[csl_field_lower]['csl'])
        print('  CSL variable', csl_field, 'assumed to be described by', data[csl_field_lower])
        data[csl_field_lower]['type'] = csl_format

      else:
        print('  adding missing CSL variable', csl_field)
        data[csl_field.lower()] = { 'csl': [ csl_field ], 'type': csl_format, 'id': csl_field }

    with open(output, 'w') as f:
      json.dump(data, f, indent='  ')

print('Generating extra-fields...')
extraFields = ExtraFields()
extraFields.load(data.zotero)
extraFields.load(data.jurism)
extraFields.save(os.path.join(root, 'gen', 'extra-fields.json'))

print('Generating item field metadata...')
ValidFields = DefaultMunch(None, {})
ValidTypes = {}
Alias = {}
Itemfields = set()
ItemCreators = {}
for client in data.keys():
  ItemCreators[client] = {}

  for spec in data[client].itemTypes:
    ItemCreators[client][spec.itemType] = [ct.creatorType for ct in spec.get('creatorTypes', [])]

    if spec.itemType in ValidTypes:
      ValidTypes[spec.itemType] = 'true'
    else:
      ValidTypes[spec.itemType] = client

    if not ValidFields[spec.itemType]:
      if spec.itemType == 'note':
        ValidFields[spec.itemType] = DefaultMunch(None, {field: 'true' for field in 'itemType tags note id itemID dateAdded dateModified'.split(' ')})
      elif spec.itemType == 'attachment':
        ValidFields[spec.itemType] = DefaultMunch(None, {field: 'true' for field in 'itemType tags id itemID dateAdded dateModified'.split(' ')})
      else:
        ValidFields[spec.itemType] = DefaultMunch(None, {field: 'true' for field in 'itemType creators tags attachments notes seeAlso id itemID dateAdded dateModified multi'.split(' ')})

    for field in spec.fields:
      if field.baseField:
        if not field.baseField in Alias: Alias[field.baseField] = Munch(zotero=set(), jurism=set())
        Alias[field.baseField][client].add(field.field)

        fieldName = field.baseField
      else:
        fieldName = field.field

      if spec.itemType not in ['note', 'attachment']: Itemfields.add(fieldName)

      if ValidFields[spec.itemType][fieldName]:
        ValidFields[spec.itemType][fieldName] = 'true'
      else:
        ValidFields[spec.itemType][fieldName] = client

    if len(spec.get('creatorTypes', [])) > 0:
      if ValidFields[spec.itemType]['creators']:
        ValidFields[spec.itemType]['creators'] = 'true'
      else:
        ValidFields[spec.itemType]['creators'] = client

for field, aliases in list(Alias.items()):
  Alias[field] = Munch(
    both = [alias for alias in aliases.zotero if alias in aliases.jurism],
    zotero = [alias for alias in aliases.zotero if alias not in aliases.jurism],
    jurism = [alias for alias in aliases.jurism if alias not in aliases.zotero]
  )

def replace(indent, aliases):
  aliases = [f'item.{alias}' for alias in aliases]
  replacement = ''

  if len(aliases) > 1:
    replacement += f"  {indent}if (v = ({' || '.join(aliases)})) item.{field} = v\n"
  else:
    replacement += f"  {indent}if ({aliases[0]}) item.{field} = {aliases[0]}\n"

  for alias in aliases:
    replacement += f'  {indent}delete {alias}\n'
  replacement += '\n'
  return replacement

with open(os.path.join(root, 'gen', 'itemfields.ts'), 'w') as f:
  print('declare const Zotero: any\n', file=f)
  print("const jurism = Zotero.BetterBibTeX.client() === 'jurism'", file=f)
  print('const zotero = !jurism\n', file=f)
  print('export const valid = {', file=f)
  print('  type: {', file=f)
  for itemType, client in sorted(ValidTypes.items(), key=lambda x: x[0]):
    print(f'    {itemType}: {client},', file=f)
  print('  },', file=f)
  print('  field: {', file=f)
  for itemType, fields in sorted(ValidFields.items(), key=lambda x: x[0]):
    print(f'    {itemType}: {{', file=f)
    for field, client in sorted(fields.items(), key=lambda x: x[0]):
      print(f'      {field}: {client},', file=f)
    print('    },', file=f)
  print('  },', file=f)
  print('}\n', file=f)

  print('function unalias(item) {', file=f)
  print('  delete item.inPublications', file=f)
  unalias = '  let v\n\n'
  for client in ['both', 'zotero', 'jurism']:
    if client != 'both': unalias += f'  if ({client}) {{\n'

    for field, aliases in Alias.items():
      if len(aliases[client]) > 0:
        if client == 'both':
          unalias += replace('', aliases[client])
        else:
          unalias += replace('  ', aliases[client])

    if client != 'both': unalias = unalias.rstrip() + '\n  }\n\n'
  print(unalias.rstrip(), file=f)
  print('}', file=f)

  print('''\n// import & export translators expect different creator formats... nice
export function simplifyForExport(item, dropAttachments = false) {
  unalias(item)

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

  if (item.itemType === 'attachment' || item.itemType === 'note') {
    delete item.attachments
    delete item.notes
  } else {
    item.attachments = (!dropAttachments && item.attachments) || []
    item.notes = item.notes ? item.notes.map(note =>  note.note || note ) : []
  }

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
}''', file=f)

with open(os.path.join(root, 'gen', 'typings', 'serialized-item.d.ts'), 'w') as f:
  fields = '\n'.join(f'    {field}: string' for field in sorted(Itemfields))
  print("import { Fields } from '../../content/extra'", file=f)
  print(f'''declare global {{
  interface ISerializedItem {{
    // fields common to all items
    itemID: string | number
    itemType: string
    dateAdded: string
    dateModified: string
    creators: {{ creatorType?: string, name?: string, firstName?: string, lastName?:string, fieldMode?: number }}[]
    tags: Array<{{ tag: string, type?: number }}>
    notes: string[]
    attachments: {{ path: string, title?: string, mimeType?: string }}
    raw: boolean
    autoJournalAbbreviation?: string

{fields}

    relations: {{ 'dc:relation': string[] }}
    uri: string
    referenceType: string
    cslType: string
    cslVolumeTitle: string
    citekey: string
    collections: string[]
    extraFields: Fields
    arXiv: {{ source?: string, id: string, category?: string }}
    // Juris-M extras
    multi: any
  }}
}}''', file=f)

with open(os.path.join(root, 'gen', 'item-creators.json'), 'w') as f:
  json.dump(ItemCreators, f, indent='  ')
