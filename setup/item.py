#!/usr/bin/env python3

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv(), override=True)
import json
from munch import munchify
import os

from pytablewriter import MarkdownTableWriter

from mako import exceptions
from mako.template import Template
from collections import defaultdict
import re

os.makedirs('gen/items', exist_ok=True)

with open('submodules/zotero/resource/schema/global/schema.json') as f:
  Zotero = munchify(json.load(f))
with open('submodules/citation-style-language-schema/schemas/input/csl-data.json') as f:
  CSL = munchify(json.load(f))

with open('site/layouts/shortcodes/citekey-formatters/creatortypes.html', 'w') as f:
  creators = [f'`{cr}`' for cr in Zotero.locales['en-US'].creatorTypes.keys()]
  f.write(', '.join(creators))

def template(tmpl):
  return Template(filename=os.path.join('setup/templates', tmpl))

print('  writing typing for serialized item')
with open(os.path.join('gen/typings/serialized.d.ts'), 'w') as f:
  try:
    print(template('items/serialized.d.ts.mako').render(schema=Zotero).strip(), file=f)
  except:
    print(exceptions.text_error_template().render())

print('  writing zotero citation key formatter')
with open('submodules/translators/BibTeX.js') as fin, open('gen/ZoteroBibTeX.mjs', 'w') as fout:
  fout.write('''
    const ZU = Zotero.Utilities;
    const Z = {
      getHiddenPref(p) {
        return Zotero.Prefs.get('translators.' + p);
      }
    };
  ''')
  fout.write('const ZOTERO_TRANSLATOR_INFO = ')
  fout.write(fin.read()
    .replace('Zotero.Utilities.strToDate', 'Zotero.Date.strToDate')
  )
  fout.write('\nexport { buildCiteKey, detectImport }\n')

with open('site/layouts/shortcodes/extra-fields.md', 'w') as f:
  def label(v):
    return re.sub(r'([a-z])([A-Z])', r'\1 \2', v).replace('-', ' ').replace('_', ' ').lower()
  doc = defaultdict(lambda: munchify({'type': 'text', 'zotero': [], 'csl': []}))
  for itemType in Zotero.itemTypes:
    for field in itemType.fields:
      doc[label(field.field)].zotero.append(field.field)
      if 'baseField' in field:
        doc[label(field.field)].zotero.append(field.baseField)
        doc[label(field.baseField)].zotero.append(field.baseField)
        baseField = field.baseField
      else:
        baseField = field.field
      if baseField in Zotero.meta.fields:
        doc[label(field.field)].type = Zotero.meta.fields[baseField].type
  for itemType in Zotero.itemTypes:
    for creator in itemType.creatorTypes:
      doc[label(creator.creatorType)].zotero.append(creator.creatorType)
      doc[label(creator.creatorType)].type = 'name'

  def cslconnect(csl, zotero):
    doc[label(csl)].csl.append(csl)
    doc[label(zotero)].csl.append(csl)
    doc[label(csl)].zotero.append(zotero)
    for itemType in Zotero.itemTypes:
      for field in itemType.fields:
        if field.field == zotero:
          doc[label(csl)].zotero.append(field.field)
          if 'baseField' in field:
            doc[label(csl)].zotero.append(field.baseField)
      for creator in itemType.creatorTypes:
        if creator.creatorType == zotero:
          doc[label(csl)].zotero.append(creator.creatorType)

  for csl, zoteroFields in Zotero.csl.fields.text.items():
    for zotero in zoteroFields:
      cslconnect(csl, zotero)
  for csl, zotero in Zotero.csl.fields.date.items():
    cslconnect(csl, zotero)
  for zotero, csl in Zotero.csl.names.items():
    cslconnect(csl, zotero)

  def csltype(t):
    match t.get('$ref'):
      case '#/definitions/name-variable':
        return 'name'
      case '#/definitions/date-variable':
        return 'date'

    if type(t.type) == list:
      if 'number' in t.type or 'string' in t.type:
        return 'text'
      return '/'.join(t.type)

    match t.type:
      case 'string' | 'number':
        return 'text'
      case 'array':
        return csltype(t['items'])
      case 'object':
        return None
  for csl, meta in CSL['items'].properties.items():
    doc[label(csl)].csl.append(csl)
    doc[label(csl)].type = csltype(meta)

  del doc['extra']
  del doc['note']
  del doc['abstract']
  del doc['abstract note']
  writer = MarkdownTableWriter()
  writer.headers = ['label', 'type', 'zotero', 'csl']
  writer.value_matrix = []
  def escaped(s):
    if type(s) == str:
      s = [s]
    return ' / '.join([f.replace('_', '\\_') for f in sorted(list(set(s)))])
  for field, data in sorted(doc.items(), key=lambda x: re.sub(r'[^a-zA-Z]', '', x[0])):
    writer.value_matrix.append( ( f'**{escaped(field)}**', data['type'], escaped(data['zotero']), escaped(data['csl']) ) )
  writer.stream = f
  writer.write_table()

#
#with open(os.path.join(ITEMS, 'extra-fields.json'), 'w') as f:
#  json.dump(mapping, f, sort_keys=True, indent='  ')
