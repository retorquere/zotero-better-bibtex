#!/usr/bin/env python3

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv(), override=True)
import json
from munch import munchify
import os

from mako import exceptions
from mako.template import Template

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

print('  writing csl-metadata')
with open('gen/items/csl.json', 'w') as f:
  schema = csl['items'].properties
  for p, m in schema.items():
    if 'type' in m and type(m.type) == list:
      m.type = sorted(m.type)
  json.dump(schema, f, indent='  ')

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

#with open(os.path.join(root, 'site/layouts/shortcodes/extra-fields.md'), 'w') as f:
#  writer = MarkdownTableWriter()
#  writer.headers = ['label', 'type', 'zotero/jurism', 'csl']
#  writer.value_matrix = []
#  doc = {}
#  for label, data in self.dg.nodes(data=True):
#    if not ' ' in label or data['domain'] != 'label': continue
#    name = data['name']
#    doc[name] = {'zotero': [], 'csl': []}
#    for _, to in self.dg.out_edges(label):
#      data = self.dg.nodes[to]
#
#      if not 'type' in doc[name]:
#        doc[name]['type'] = data['type']
#      else:
#        assert doc[name]['type'] == data['type']
#
#      if data.get('zotero', False) == data.get('jurism', False):
#        postfix = ''
#      elif data.get('zotero'):
#        postfix = '\u00B2'
#      else:
#        postfix = '\u00B9'
#      doc[name][data['domain']].append(data['name'].replace('_', '\\_') + postfix)
#  for label, data in sorted(doc.items(), key=lambda x: x[0]):
#    writer.value_matrix.append((f'**{label}**', data['type'], ' / '.join(sorted(data['zotero'])), ' / '.join(sorted(data['csl']))))
#  writer.stream = f
#  writer.write_table()
#
#with open(os.path.join(ITEMS, 'extra-fields.json'), 'w') as f:
#  json.dump(mapping, f, sort_keys=True, indent='  ')
