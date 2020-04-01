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

def load(url, schema, lm=None):
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

data = DefaultMunch.fromDict({
  'zotero': load('https://api.zotero.org/schema', 'zotero.json'),
  'jurism': load('https://raw.githubusercontent.com/Juris-M/zotero-schema/master/schema-jurism.json', 'juris-m.json', 'https://api.github.com/repos/Juris-M/zotero-schema/contents/schema-jurism.json?ref=master'),
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

  def dict_merge(self, base_dct, merge_dct):
    rtn_dct = base_dct.copy()

    rtn_dct.update({
        key: self.dict_merge(rtn_dct[key], merge_dct[key])
        if isinstance(rtn_dct.get(key), dict) and isinstance(merge_dct[key], dict)
        else merge_dct[key]
        for key in merge_dct.keys()
    })

    return rtn_dct

  def __init__(self):
    self.ef = Munch(zotero=defaultdict(Munch), csl=defaultdict(Munch))

  def load(self, data, fixes = {}):
    data = self.dict_merge(data, fixes)
    data = Munch.fromDict(data)
    locale = data.locales['en-US']

    # no extra-fields for these
    data.itemTypes = [ itemType for itemType in data.itemTypes if itemType.itemType not in ['attachment', 'note'] ]

    data.meta.fields.accessDate = Munch(type='date')
    basefield = {}

    common = None
    # find basefields and shared fields
    for itemType in data.itemTypes:
      for field in itemType.fields:
        if 'baseField' in field:
          basefield[field.field] = field.baseField

      if common is None:
        common = set(basefield.get(field.field, field.field) for field in itemType.fields)
      else:
        common = common.intersection(set(basefield.get(field.field, field.field) for field in itemType.fields))

    #print(common)
    # ignore all fields that are in all items, as these will have a UI field
    #for itemType in data.itemTypes:
    #  itemType.fields = [field for field in itemType.fields if not basefield.get(field.field, field.field) in common]
    #  itemType.creatorTyped = [creator for creator in itemType.creatorTypes if not basefield.get(creator.creatorType, creator.creatorType) in common]
    #data.meta.fields = { field: meta for field, meta in data.meta.fields.items() if field in common }
    #locale.fields = { field: label for field, label in locale.fields.items() if not field in common }
    #for csl, zotero in fielddata.csl.fields.text.items():
    #  fielddata.csl.fields.text[csl] = [ field for field in zotero if not field in common ]

    # map labels
    for field, label in locale.fields.items():
      if '.' in label or '#' in label:
        label = re.sub(r'([a-z])([A-Z])', lambda x: x.group(1) + ' ' + x.group(2), field)

      self.ef.zotero[label.lower()].zotero = basefield.get(field, field)

    for field, label in locale.creatorTypes.items():
      self.ef.zotero[label.lower()].zotero = basefield.get(field, field)
      self.ef.zotero[label.lower()].type = 'creator'

    # fix types
    for var, meta in data.meta.fields.items():
      if meta.type == 'text': continue

      for field in self.ef.zotero.values():
        if field.zotero == var:
          field.type = meta.type

    # scan itemTypes
    for itemType in data.itemTypes:
      for field in itemType.fields:
        assert any(field for field in self.ef.zotero.values() if field.zotero == var)

      for creator in itemType.creatorTypes:
        assert any(field for field in self.ef.zotero.values() if field.zotero == creator.creatorType)
        for field in self.ef.zotero.values():
          if field.zotero == creator.creatorType:
            assert field.type == 'creator'

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
      self.ef.csl[csl.lower()].csl = csl
      self.ef.csl[csl.lower()].zotero = [basefield.get(z, z) for z in zotero]

      types = add_csl(csl, self.ef.csl[csl.lower()].zotero)
      if len(types) == 1: self.ef.csl[csl.lower()].type = types[0]

    for csl, zotero in data.csl.fields.date.items():
      self.ef.csl[csl.lower()].csl = csl
      self.ef.csl[csl.lower()].type = 'date'
      self.ef.csl[csl.lower()].zotero = [basefield.get(zotero, zotero)]

      types = add_csl(csl, self.ef.csl[csl.lower()].zotero)
      if len(types) != 0:
        assert self.ef.csl[csl.lower()].type == types[0], str((self.ef.csl[csl.lower()].type, types))

    for zotero, csl in data.csl.names.items():
      self.ef.csl[csl.lower()].csl = csl
      self.ef.csl[csl.lower()].type = 'creator'
      self.ef.csl[csl.lower()].zotero = [basefield.get(zotero, zotero)]

      types = add_csl(csl, self.ef.csl[csl.lower()].zotero)
      assert self.ef.csl[csl.lower()].type == types[0]

  def save(self, path):
    with open(os.path.join(root, 'setup/csl-vars.json')) as f:
      for csl, _type in json.load(f).items():
        if csl[0] == '.': continue

        self.ef.csl[csl.lower()].csl = csl
        if _type != 'text': self.ef.csl[csl.lower()].type = _type

    for field in self.ef.zotero.values():
      if 'csl' in field and len(field.csl) == 1:
        field.csl = field.csl[0]
      else:
        field.pop('csl', None)
    for field in self.ef.csl.values():
      if 'zotero' in field and len(field.zotero) == 1:
        field.zotero = field.zotero[0]
      else:
        field.pop('zotero', None)

    simple = {}
    # zotero takes precedence
    for label, field in self.ef.zotero.items():
      simple[label] = field
      if not field.zotero in simple:
        simple[field.zotero] = field
    for label, field in self.ef.csl.items():
      if not label in simple:
        simple[label] = field
      if not field.csl in simple:
        simple[field.csl] = field

    with open(path, 'w') as f:
      json.dump(simple, f, indent='  ', default=ExtraFields.to_json)

print('Generating extra-fields...')
extraFields = ExtraFields()
extraFields.load(data.zotero, {
  'locales': {
    'en-US': {
      'fields': {
        'programmingLanguage': 'Programming Language'
      }
    }
  },
  'meta': {
    'fields': {
      'accessDate': {
        'type': 'date'
      }
    }
  }
})
extraFields.load(data.jurism, {
  'locales': {
    'en-US': {
      'fields': {
        'programmingLanguage': 'Programming Language'
      }
    }
  },
  'meta': {
    'fields': {
      'accessDate': {
        'type': 'date'
      }
    }
  },
  'csl': {
    'fields': {
      'text': {
        'volume-title': [ 'volumeTitle' ]
      }
    }
  }
})
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
