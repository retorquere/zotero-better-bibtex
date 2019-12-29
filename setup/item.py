#!/usr/bin/env python3

print('Generating field mapping for CSL variables...')
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

valid = DefaultMunch(None, {})
alias = {}
itemfields = set()
for client in data.keys():
  for spec in data[client].itemTypes:
    if not valid[spec.itemType]: valid[spec.itemType] = DefaultMunch(None, {})

    for field in spec.fields:
      if field.baseField:
        if not field.baseField in alias: alias[field.baseField] = set()
        alias[field.baseField].add(f'item.{field.field}')
        fieldName = field.baseField
      else:
        fieldName = field.field

      if spec.itemType not in ['note', 'attachment']: itemfields.add(fieldName)

      if valid[spec.itemType][fieldName]:
        valid[spec.itemType][fieldName] = 'true'
      else:
        valid[spec.itemType][fieldName] = client
    if len(spec.get('creatorTypes', [])) > 0:
      if valid[spec.itemType]['creators']:
        valid[spec.itemType]['creators'] = 'true'
      else:
        valid[spec.itemType]['creators'] = client

with open(os.path.join(root, 'gen', 'itemfields.ts'), 'w') as f:
  print('// tslint:disable:one-line\n', file=f)
  print('declare const Zotero: any\n', file=f)
  print("const jurism = Zotero.Utilities.getVersion().includes('m')", file=f)
  print('const zotero = !jurism\n', file=f)
  print('export const valid = {', file=f)
  for itemType, fields in sorted(valid.items(), key=lambda x: x[0]):
    print(f'  {itemType}: {{', file=f)
    for field, client in sorted(fields.items(), key=lambda x: x[0]):
      print(f'    {field}: {client},', file=f)
    print('  },', file=f)
  print('}\n', file=f)
  print('function unalias(item) {', file=f)
  for field, aliases in sorted(alias.items(), key=lambda x: x[0]):
    print(f'  item.{field} = item.{field} || {" || ".join(sorted(aliases))}', file=f)
  print('}', file=f)

  print('''\n// import & export translators expect different creator formats... nice
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
}''', file=f)

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
  fields = '\n'.join(f'    {field}: string' for field in sorted(itemfields))
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

{fields}

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
