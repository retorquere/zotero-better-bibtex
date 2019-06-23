#!/usr/bin/env python3

from lxml import etree
import json
import os.path
import textwrap
from contextlib import contextmanager
from pathlib import Path
import glob
import sys
from slugify import slugify
import frontmatter

from ruamel.yaml import YAML
yaml = YAML(typ='safe')
yaml.default_flow_style = False

root = os.path.join(os.path.dirname(__file__), '..')
prefix = 'extensions.zotero.translators.better-bibtex.'

@contextmanager
def dump(*paths):

  def save(data):
    for path in paths:
      print(' ', path)
      path = os.path.join(root, path)
      os.makedirs(os.path.dirname(path), exist_ok=True)
      with open(path, 'w') as out:
        _, ext = os.path.splitext(path)

        if ext == '.json':
          json.dump(data, out, indent=2, sort_keys=True)
        elif ext == '.yml':
          yaml.dump(data, out)
        elif ext == '.js':
          for pref in sorted(data.keys()):
            print(f'pref({json.dumps(prefix + pref)}, {json.dumps(data[pref])});', file=out)
        else:
          raise ValueError(f'Unknown extension {ext}')

  yield save

print('checking XUL translations')
translations = {}
with open(os.path.join(root, 'locale', 'en-US', 'zotero-better-bibtex.dtd')) as dtd:
  entities = list(etree.DTD(dtd).entities())
  for entity in entities:
    translations[entity.name] = []

  for xul in glob.glob(os.path.join(root, 'content', '*.xul')):
    with open(xul, 'r') as xml:
      xml = xml.read()
      for entity in entities:
        _xml = xml.replace(f'&{entity.name};', entity.content)
        if _xml != xml: translations[entity.name].append(os.path.splitext(os.path.basename(xul))[0])
        xml = _xml
      try:
        etree.fromstring(xml)
      except etree.XMLSyntaxError as err:
        print(os.path.relpath(xul, root), ':', err)
        sys.exit(1)

for string, panes in translations.items():
  if len(panes) == 0:
    print(f'  Unused translation string "{string}"')

  for pane in panes:
    if not string.startswith(f'better-bibtex.{pane}.'):
      print(f'  {string} used in {pane}')

print('extracting preferences')

with open(os.path.join(root, 'content', 'Preferences.xul'), 'r') as xul:
  pane = xul.read()

with open(os.path.join(root, 'locale', 'en-US', 'zotero-better-bibtex.dtd')) as dtd:
  for entity in etree.DTD(dtd).entities():
    pane = pane.replace(f'&{entity.name};', entity.content)

pane = pane.replace('xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"', '')
pane = etree.fromstring(pane)

# sanity check

for index, tabbox in enumerate(pane.xpath('//tabbox')):
  tabs = len(tabbox.xpath('./tabs/tab|./arrowscrollbox/tabs/tab'))
  tabpanels = len(tabbox.xpath('./tabpanels/tabpanel'))
  if tabs == tabpanels: continue
  id = tabbox.attrib['id'] if 'id' in tabbox.attrib else str(index + 1)
  raise ValueError(f'tabbox {id}: {tabs} tabs, {tabpanels} tabpanels')

# prefs parsing

preferences = {}
for pref in pane.xpath('//preference'):
  name = pref.attrib['name'].replace(prefix, '')
  preferences[name] = {
    'name': name,
    'type': pref.attrib['type'],
  }
  if 'id' in pref.attrib: preferences[name]['id'] = pref.attrib['id']

  description = pref.getnext()
  description = description.text if description.tag is etree.Comment else ''
  description = description[1:] if description[0] == '!' else ''
  if description[0] == '!':
    preferences[name]['hidden'] = True
    description = description[1:]
  if not 'hidden' in preferences[name] and description.strip() == '': raise ValueError(f'Undocumented preference {name}')
  description = textwrap.dedent(description).strip()
  if description != '': preferences[name]['description'] = description

  if pref.attrib['type'] == 'bool':
    preferences[name]['type'] = 'boolean'
    preferences[name]['default'] = (pref.attrib['default'] == 'true')

  elif pref.attrib['type'] == 'int':
    preferences[name]['type'] = 'number'
    preferences[name]['default'] = int(pref.attrib['default'])

  elif pref.attrib['type'] == 'string':
    preferences[name]['type'] = 'string'
    preferences[name]['default'] = pref.attrib['default']

  else:
    raise ValueError(pref.attrib['type'])

tabs = []
for tab in pane.xpath('//prefpane/tabbox/tabs/tab'):
  tabs.append({
    'name': tab.attrib['label'],
    'description': '',
    'preferences': [],
  })

tab = -1
for tabpanel in pane.xpath('//prefpane/tabbox/tabpanels/tabpanel'):
  tab += 1

  for label in tabpanel.xpath('.//*[@preference or @forpreference]'):
    id = label.attrib['forpreference'] if 'forpreference' in label.attrib else label.attrib['preference']

    pref = [p for p in preferences.values() if 'id' in p and p['id'] == id]
    if len(pref) != 1: raise ValueError(f'{id}: {len(pref)}')
    pref = pref[0]

    if 'tab' in pref and pref['tab'] != tab: raise ValueError(f'{pref["name"]} assigned to tab {pref["tab"]} and {tab}')
    pref['tab'] = tab
    tabs[tab]['preferences'].append(pref['name'])

    if 'preference' in label.attrib and 'label' in pref: continue

    if label.tag == 'label':
      pref['label'] = label.text
    elif label.tag == 'checkbox':
      pref['label'] = label.attrib['label']
    elif label.tag == 'tab':
      pref['label'] = label.attrib['label']
    else:
      raise ValueError(label.tag)

    pref['label'] = pref['label'].strip().rstrip(':').strip()

for menulist in pane.xpath('//menulist[@preference]'):
  id = menulist.attrib['preference']
  pref = [p for p in preferences.values() if 'id' in p and p['id'] == id][0]

  options = menulist.xpath('.//menuitem')
  if len(options) == 0: continue # dynamic menu

  pref['options'] = {}
  pref['option_order'] = []
  for menuitem in options:
    value = menuitem.attrib['value']
    if pref['type'] == 'number': value = int(value)
    pref['options'][value] = menuitem.attrib['label']
    pref['option_order'].append(value)

for override in pane.xpath('//*[@ae-field]'):
  name = override.attrib['ae-field']
  if name in preferences: preferences[name]['override'] = True

# consistency checks

for pref in preferences.values():
  if 'override' in pref and 'hidden' in pref: raise ValueError(f'{pref["name"]}: hidden + override')
  if 'hidden' in pref and 'tab' in pref: raise ValueError(f'{pref["name"]}: hidden + tab')
  if 'hidden' not in pref and 'tab' not in pref: raise ValueError(f'{json.dumps(pref)}: !hidden + !tab')

# cleanup
for pref in preferences.values():
  if 'tab' in pref: del pref['tab']

# flush

with dump('gen/preferences/preferences.json') as save:
  save(preferences)

with dump('gen/preferences/defaults.json', 'build/defaults/preferences/defaults.js') as save:
  defaults = {
    #'testing': False,
  }
  for pref in preferences.values():
    defaults[pref['name']] = pref['default']
  save(defaults)

overrides = [pref for pref in preferences.values() if 'override' in pref]
with dump('gen/preferences/auto-export-overrides.json') as save:
  save(sorted([pref['name'] for pref in overrides]))
with dump('gen/preferences/auto-export-overrides-schema.json') as save:
  schema = {}
  for pref in sorted(overrides, key=lambda p: p['name']):
    if pref['type'] == 'boolean':
      schema[pref['name']] = { 'type': 'boolean' }
    else:
      schema[pref['name']] = { 'enum': list(pref['options'].keys()) }
  save(schema)

with dump('site/data/preferences/defaults.yml') as save:
  save({name: pref['default'] for (name, pref) in preferences.items()})

with dump('site/data/preferences/tabs.yml') as save:
  config = []
  for tab in tabs:
    tab = tab.copy()
    names = tab['preferences']
    tab['preferences'] = {}
    for name in names:
      pref = preferences[name]
      label = pref['label']

      tab['preferences'][label] = {
        'description': pref['description']
      }

      if 'options' in pref:
        tab['preferences'][label]['default'] = pref['options'][pref['default']]
        tab['preferences'][label]['options'] = list(pref['options'].values())
      else:
        tab['preferences'][label]['default'] = str(pref['default'])
    config.append(tab)

  # hidden prefs
  tab = {
    'name': 'Hidden preferences',
    'description': textwrap.dedent("""
      The following settings are not exposed in the UI, but can be found under `Preferences`/`Advanced`/`Config editor`.

      All are prefixed with `extensions.zotero.translators.better-bibtex.` in the table you will find there
    """),
    'preferences': {},
  }
  for pref in preferences.values():
    if not 'hidden' in pref or not 'description' in pref: continue
    tab['preferences'][pref['name']] = {
      'description': pref['description'],
      'default': str(pref['default']),
    }
  config.append(tab)

  save(config)

with dump('site/data/preferences/slugs.yml') as save:
  prefs = {}
  for tab in config:
    prefs[slugify(tab['name'])] = tab
  save(prefs)
