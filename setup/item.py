#!/usr/bin/env python3

import os, sys
import urllib.request
import json
from munch import Munch, DefaultMunch
from collections import defaultdict
import copy
import re
import time

root = os.path.join(os.path.dirname(__file__), '..')

print('Generating extra-fields...')

def load(url, schema, lm=None):
  if type(lm) == bool:
    # GH doesn't want our LM check, fine
    assert not lm
    with urllib.request.urlopen(url) as i:
      with open(os.path.join(root, 'schema', schema), 'w') as o:
        print(i.read().decode(), file=o)
  else:
    if lm is None: lm = url
    request = urllib.request.Request(lm)
    request.get_method = lambda: 'HEAD'
    with urllib.request.urlopen(request) as r:
      last_modified = r.getheader('last-modified')
      last_modified = time.strptime(last_modified, '%a, %d %b %Y %H:%M:%S %Z')
      last_modified = time.strftime('%Y-%m-%dT%H-%M-%SZ', last_modified)
      schema  = f'{last_modified}-{schema}'
  try:
    with open(os.path.join(root, 'schema', schema)) as f:
      return json.load(f)
  except FileNotFoundError:
    print(schema, f'does not exist, get with "curl -Lo schema/{schema} {url}"')
    sys.exit(1)

def fix_csl_vars(proposed, name, csl_vars):
  for var in list(proposed.keys()):
    if not var in csl_vars and not f'.{var}' in csl_vars:
      print(f'  {name}: discarding bogus CSL variable', var)
      proposed.pop(var)

def fix_zotero_schema(schema):
  schema = Munch.fromDict(schema)

  # missing date field
  schema.meta.fields.accessDate = { 'type': 'date' }

  # status is publication status, not legal status
  schema.csl.fields.text.status = [ 'status' ]

  with open(os.path.join(root, 'setup/csl-vars.json')) as f:
    csl_vars = set(json.load(f).keys())
    fix_csl_vars(schema.csl.fields.text, 'zotero', csl_vars)
    fix_csl_vars(schema.csl.fields.date, 'zotero', csl_vars)
    fix_csl_vars(schema.csl.names, 'zotero', csl_vars)

  return Munch.toDict(schema)

def fix_jurism_schema(schema):
  schema = Munch.fromDict(schema)

  # missing date field
  schema.meta.fields.accessDate = { 'type': 'date' }

  # missing variable mapping
  schema.csl.fields.text['volume-title'] = [ 'volumeTitle' ]

  # status is publication status, not legal status
  schema.csl.fields.text.status = [ 'status ']

  with open(os.path.join(root, 'setup/csl-vars.json')) as f:
    csl_vars = set(json.load(f).keys())
    fix_csl_vars(schema.csl.fields.text, 'jurism', csl_vars)
    fix_csl_vars(schema.csl.fields.date, 'jurism', csl_vars)
    fix_csl_vars(schema.csl.names, 'jurism', csl_vars)

  return Munch.toDict(schema)

data = DefaultMunch.fromDict({
  'zotero': fix_zotero_schema(load('https://api.zotero.org/schema', 'zotero.json')),
  #'jurism': fix_jurism_schema(load('https://raw.githubusercontent.com/Juris-M/zotero-schema/master/schema-jurism.json', 'juris-m.json', 'https://api.github.com/repos/Juris-M/zotero-schema/contents/schema-jurism.json?ref=master')),
  'jurism': fix_jurism_schema(load('https://raw.githubusercontent.com/Juris-M/zotero-schema/master/schema-jurism.json', 'juris-m.json', False)),
}, None)

class ExtraFields:
  @staticmethod
  def to_json(obj):
    if isinstance(obj, Munch):
      return {
        k: v
        for k, v in Munch.toDict(obj).items()
        if not v is None and not (type(v) == list and len(v) == 0)
      }
    else:
      return obj

  def __init__(self):
    self.ef = Munch(zotero=defaultdict(Munch), csl=defaultdict(Munch))

  def load(self, data):
    data = Munch.fromDict(data)

    # no extra-fields for these
    data.itemTypes = [ itemType for itemType in data.itemTypes if itemType.itemType not in ['attachment', 'note'] ]


    class BaseField:
      def __init__(self):
        self.basefield = {}
      def __getitem__(self, key):
        return self.basefield.get(key, key)
      def __setitem__(self, key, value):
        self.basefield[key] = value
    basefield = BaseField()

    # find basefields
    for itemType in data.itemTypes:
      for field in itemType.fields:
        if 'baseField' in field:
          basefield[field.field] = field.baseField

    # find variables
    for itemType in data.itemTypes:

      for field in itemType.fields:
        label = re.sub(r'([a-z])([A-Z])', lambda x: x.group(1) + ' ' + x.group(2), field.field).upper()
        self.ef.zotero[label].zotero = basefield[field.field]

      for creator in itemType.creatorTypes:
        label = re.sub(r'([a-z])([A-Z])', lambda x: x.group(1) + ' ' + x.group(2), creator.creatorType).upper()
        self.ef.zotero[label].zotero = basefield[creator.creatorType]
        self.ef.zotero[label].type = 'creator'

    # fix types
    for var, meta in data.meta.fields.items():
      if meta.type == 'text': continue

      for field in self.ef.zotero.values():
        if field.zotero == var:
          field.type = meta.type

    def add_csl(csl, zoteros):
      types = set()
      for zotero in zoteros:
        for field in self.ef.zotero.values():
          if field.zotero != zotero: continue

          if not 'csl' in field: field.csl = []
          field.csl.append(csl)
          field.csl = sorted(set(field.csl))
          if 'type' in field: types.add(field.type)
      assert len(types) < 2
      return list(types)

    # map csl
    for csl, zotero in data.csl.fields.text.items():
      self.ef.csl[csl].csl = csl
      self.ef.csl[csl].zotero = [basefield[z] for z in zotero]

      types = add_csl(csl, self.ef.csl[csl].zotero)
      if len(types) == 1: self.ef.csl[csl].type = types[0]

    for csl, zotero in data.csl.fields.date.items():
      self.ef.csl[csl].csl = csl
      self.ef.csl[csl].type = 'date'
      self.ef.csl[csl].zotero = [basefield[zotero]]

      types = add_csl(csl, self.ef.csl[csl].zotero)
      if len(types) != 0:
        assert self.ef.csl[csl].type == types[0], str((self.ef.csl[csl].type, types))

    for zotero, csl in data.csl.names.items():
      self.ef.csl[csl].csl = csl
      self.ef.csl[csl].type = 'creator'
      self.ef.csl[csl].zotero = [basefield[zotero]]

      types = add_csl(csl, self.ef.csl[csl].zotero)
      assert self.ef.csl[csl].type == types[0]

  def save(self, path):
    with open(os.path.join(root, 'setup/csl-vars.json')) as f:
      for csl, _type in json.load(f).items():
        if csl[0] == '.': continue

        self.ef.csl[csl].csl = csl
        if _type != 'text': self.ef.csl[csl].type = _type

    for field in self.ef.zotero.values():
      if 'csl' in field:
        field.csl = sorted(list(set(field.csl)))
        if len(field.csl) == 1:
          field.csl = field.csl[0]
        else:
          field.csl = 'csl:' + '+'.join(field.csl)

    for field in self.ef.csl.values():
      if 'zotero' in field:
        field.zotero = sorted(list(set(field.zotero)))
        if len(field.zotero) == 1:
          field.zotero = field.zotero[0]
        else:
          field.zotero = 'zotero:' + '+'.join(field.zotero)

    simple = {}
    for section in ['csl', 'zotero']:
      for lower in [False, True]:
        for label, field in self.ef[section].items():
          for name in [label, field[section]]:
            if name.lower() == 'note' or name.lower() == 'extra': next
            if lower: name = name.lower()
            if not name in simple:
              simple[name] = field

    # such a mess
    simple['type'] = { 'zotero': 'type', 'csl': 'type' }
    with open(path, 'w') as f:
      json.dump(simple, f, indent='  ', default=ExtraFields.to_json)

extraFields = ExtraFields()
extraFields.load(data.jurism)
extraFields.load(data.zotero)
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
    creators: {{ creatorType?: string, name?: string, firstName?: string, lastName?:string, fieldMode?: number, source?: string }}[]
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
