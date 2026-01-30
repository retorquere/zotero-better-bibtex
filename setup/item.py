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
  zotero = munchify(json.load(f))
with open('submodules/citation-style-language-schema/schemas/input/csl-data.json') as f:
  csl = munchify(json.load(f))

with open('site/layouts/shortcodes/citekey-formatters/creatortypes.html', 'w') as f:
  creators = [f'`{cr}`' for cr in zotero.locales['en-US'].creatorTypes.keys()]
  f.write(', '.join(creators))

def template(tmpl):
  return Template(filename=os.path.join('setup/templates', tmpl))

print('  writing typing for serialized item')
with open(os.path.join('gen/typings/serialized.d.ts'), 'w') as f:
  try:
    print(template('items/serialized.d.ts.mako').render(schema=zotero).strip(), file=f)
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
  doc = defaultdict(lambda: {'type': 'text', 'zotero': [], 'csl': []})
  with open('submodules/zotero/resource/schema/global/schema.json') as s:
    schema = json.load(s)
    for itemType in schema['itemTypes']:
      for field in itemType['fields']:
        doc[field['field']]['zotero'].append(field['field'])
        if 'baseField' in field:
          doc[field['field']]['zotero'].append(field['baseField'])
          doc[field['baseField']]['zotero'].append(field['baseField'])
          baseField = field['baseField']
        else:
          baseField = field['field']
        if baseField in schema['meta']['fields']:
          doc[field['field']]['type'] = schema['meta']['fields'][baseField]['type']

    for csl, zoteros in schema['csl']['fields']['text'].items():
      for zotero in zoteros:
        doc[zotero]['csl'].append(csl)
    for csl, zotero in schema['csl']['fields']['date'].items():
      doc[zotero]['csl'].append(csl)

  writer = MarkdownTableWriter()
  writer.headers = ['label', 'type', 'zotero', 'csl']
  writer.value_matrix = []
  def label(v):
    return re.sub(r'([a-z])([A-Z])', r'\1 \2', v).lower().replace('_', '\\_')
  def escaped(s):
    return ' / '.join([f.replace('_', '\\_') for f in sorted(list(set(s)))])
  for field, data in sorted(doc.items(), key=lambda x: re.sub(r'[^a-zA-Z]', '', label(x[0]))):
    writer.value_matrix.append( ( f'**{label(field)}**', data['type'], escaped(data['zotero']), escaped(data['csl']) ) )
  writer.stream = f
  writer.write_table()
#
#with open(os.path.join(ITEMS, 'extra-fields.json'), 'w') as f:
#  json.dump(mapping, f, sort_keys=True, indent='  ')
