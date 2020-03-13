#!/usr/bin/env python3

import os
import urllib.request
import json
from munch import Munch, DefaultMunch
import copy

root = os.path.join(os.path.dirname(__file__), '..')

def load(url):
  with urllib.request.urlopen(url) as f:
    return json.loads(f.read().decode())

data = DefaultMunch.fromDict({
  'zotero': load('https://api.zotero.org/schema'),
  'jurism': load('https://raw.githubusercontent.com/Juris-M/zotero-schema/master/schema-jurism.json')
}, None)

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

  if (item.itemType !== 'attachment' && item.itemType !== 'note') item.notes = item.notes ? item.notes.map(note =>  note.note || note ) : []

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

  if (dropAttachments && item.itemType !== 'attachment' && item.itemType !== 'note') item.attachments = []

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

print('Generating field mapping for CSL variables...')
with open(os.path.join(root, 'gen', 'csl-mapping.json'), 'w') as f:
  schema = data.zotero
  mapping = Munch(
    field = DefaultMunch.fromDict(copy.deepcopy(schema.csl.fields.text.toDict())),
    creator = { v: k for k, v in schema.csl.names.items() },
  )
  for csl, zot in schema.csl.fields.date.items():
    if not mapping.field[csl]: mapping.field[csl] = []
    mapping.field[csl].append(zot)

  if mapping.field.status:
    mapping.field.status = [v for v in mapping.field.status if v != 'legalStatus'] # that's not right according to https://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables

  for section in list(mapping.keys()):
    for name in list(mapping[section].keys()):
      if len(mapping[section][name]) == 0:
        del mapping[section][name]

  json.dump(mapping, f, indent='  ')

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
