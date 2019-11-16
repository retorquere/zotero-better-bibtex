#!/usr/bin/env python3

from lxml import etree
import json
import os.path
import textwrap
from contextlib import contextmanager
from munch import Munch
from pathlib import Path
import glob
import sys
from slugify import slugify
import sqlite3
import toml

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
        elif ext == '.toml':
          toml.dump(data, out)
        elif ext == '.yml':
          yaml.dump(data, out)
        elif ext == '.js':
          for pref in sorted(data.keys()):
            print(f'pref({json.dumps(prefix + pref)}, {json.dumps(data[pref])});', file=out)
        else:
          raise ValueError(f'Unknown extension {ext}')

  yield save

def check_translations():
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

class Preferences:
  def __init__(self):
    print('extracting preferences')
    self.load()
    self.check()
    self.parse()

    self.shortcodes()

    with dump('gen/preferences/preferences.json') as save:
      preferences = {}
      for pref in self.all():
        name = pref.name
        del pref['id']
        del pref['name']
        del pref['order']
        del pref['section']
        preferences[name] = pref
      save(preferences)

    with dump('gen/preferences/defaults.json', 'build/defaults/preferences/defaults.js', 'site/data/preferences/defaults.json') as save:
      save({pref.name: pref.default for pref in self.all()})

    overrides = [pref for pref in self.all() if pref.override]
    with dump('gen/preferences/auto-export-overrides.json') as save:
      save(sorted([pref.name for pref in overrides]))
    with dump('gen/preferences/auto-export-overrides-schema.json') as save:
      schema = {}
      for pref in sorted(overrides, key=lambda p: p.name):
        if pref.type == 'boolean':
          schema[pref.name] = { 'type': 'boolean' }
        else:
          schema[pref.name] = { 'enum': list(pref.options.keys()) }
      save(schema)

  def load(self):
    with open(os.path.join(root, 'content', 'Preferences.xul'), 'r') as xul:
      pane = xul.read()
    with open(os.path.join(root, 'locale', 'en-US', 'zotero-better-bibtex.dtd')) as dtd:
      for entity in etree.DTD(dtd).entities():
        pane = pane.replace(f'&{entity.name};', entity.content)

    pane = pane.replace('xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"', '')
    self.pane = etree.fromstring(pane)

  def check(self):
    # sanity check
    for index, tabbox in enumerate(self.pane.xpath('//tabbox')):
      tabs = len(tabbox.xpath('./tabs/tab|./arrowscrollbox/tabs/tab'))
      tabpanels = len(tabbox.xpath('./tabpanels/tabpanel'))
      if tabs == tabpanels: continue
      id = tabbox.attrib['id'] if 'id' in tabbox.attrib else str(index + 1)
      raise ValueError(f'tabbox {id}: {tabs} tabs, {tabpanels} tabpanels')

  def get(self, id=None, name=None, options=dict, section=int):
    if id and name: raise ValueError('Unexpected: name + id')

    if id:
      prefs = self.db.execute('SELECT * FROM preference WHERE id = ?', (id,))
    else:
      prefs = self.db.execute('SELECT * FROM preference WHERE name = ?', (name,))

    fields = [desc[0] for desc in prefs.description]
    for pref in prefs:
      pref = Munch.fromDict(dict(zip(fields, pref)))

      pref.hidden = pref.hidden == 1
      pref.override = pref.override == 1
      if pref.type == 'boolean': pref.default = pref.default == 1

      if options == list:
        options = []
        for option in self.db.execute('SELECT value, label FROM option WHERE preference = ? ORDER BY "order"', (pref.name,)):
          options.append(Munch(value=option[0], label = option[1]))
      elif options == dict:
        options = {}
        for option in self.db.execute('SELECT value, label FROM option WHERE preference = ?', (pref.name,)):
          options[option[0]] = option[1]
      else:
        raise ValueError(f'unexpected options: {options}')
      if len(options) != 0: pref.options = options

      if section == str and not pref.hidden:
        for section in self.db.execute('SELECT slug FROM section WHERE "order" = ?', (pref.section,)):
          pref.section = section[0]

      return pref

    return None

  def all(self, options=dict, section=int, order='order'):
    if order == 'name':
      order = 'name COLLATE NOCASE ASC'
    else:
      order = f'"{order}"'
    return [self.get(name=pref[0], options=options, section=section) for pref in self.db.execute(f'SELECT name FROM preference ORDER BY {order}')]

  def parse(self):
    self.db = sqlite3.connect(':memory:', isolation_level=None)
    self.db.execute('''
      CREATE TABLE section (
        "order" PRIMARY KEY,
        slug UNIQUE NOT NULL,
        label NOT NULL, description
      )
    ''')
    self.db.execute('''
      CREATE TABLE preference (
        name PRIMARY KEY,
        "order",
        type NOT NULL,
        id UNIQUE,
        label,
        description,
        "default",
        hidden,
        override,
        section,

        FOREIGN KEY(section) REFERENCES section("order")
      )
    ''')
    self.db.execute('''
      CREATE TABLE option (
        "order",
        preference,
        value,
        label,

        PRIMARY KEY("order", preference),
        FOREIGN KEY(preference) REFERENCES preference(name)
      )
    ''')

    # sections
    for order, section in enumerate(self.pane.xpath('//prefpane/tabbox/tabs/tab')):
      self.db.execute('INSERT INTO section ("order", slug, label) VALUES (?, ?, ?)', (order, slugify(section.attrib['label']), section.attrib['label']))

    # preferences
    for pref in self.pane.xpath('//preference'):
      name = pref.attrib['name'].replace(prefix, '')
      self.db.execute('INSERT INTO preference (name, type) VALUES (?, ?)', (name, pref.attrib['type']))
      if 'id' in pref.attrib: self.db.execute('UPDATE preference SET id = ? WHERE name = ?', (pref.attrib['id'], name))

      description = pref.getnext()

      if description.tag is etree.Comment:
        description = description.text
      else:
        description = ''

      if description[0] == '!':
        description = description[1:]
      else:
        description = ''

      if description[0] == '!':
        self.db.execute('UPDATE preference SET hidden = ? WHERE name = ?', (True, name))
        description = description[1:]
      elif description.strip() == '':
        raise ValueError(f'Undocumented preference {name}')

      description = textwrap.dedent(description).strip()
      if description != '': self.db.execute('UPDATE preference SET description = ? WHERE name = ?', (description, name))

      if pref.attrib['type'] == 'bool':
        self.db.execute('UPDATE preference SET type = ?, "default" = ? WHERE name = ?', ('boolean', (pref.attrib['default'] == 'true'), name))

      elif pref.attrib['type'] == 'int':
        self.db.execute('UPDATE preference SET type = ?, "default" = ? WHERE name = ?', ('number', int(pref.attrib['default']), name))

      elif pref.attrib['type'] == 'string':
        self.db.execute('UPDATE preference SET type = ?, "default" = ? WHERE name = ?', ('string', pref.attrib['default'], name))

      else:
        raise ValueError(pref.attrib['type'])

    # section assignment
    order = 0
    for section, tabpanel in enumerate(self.pane.xpath('//prefpane/tabbox/tabpanels/tabpanel')):
      for label in tabpanel.xpath('.//*[@preference or @forpreference]'):
        if 'forpreference' in label.attrib:
          id = label.attrib['forpreference']
        else:
          id = label.attrib['preference']
    
        pref = self.get(id=id)
        if not pref: raise ValueError(f'{id}: not found')
    
        if pref.section and pref.section != section: raise ValueError(f'{pref.name} assigned to section {section} and {pref.section}')

        order += 1

        self.db.execute('UPDATE preference SET section = ?, "order" = ? WHERE id = ?', (section, order, pref.id))
    
        if 'preference' in label.attrib and pref.label: continue
    
        if label.tag == 'label':
          label = label.text
        elif label.tag in ['checkbox', 'tab']:
          label = label.attrib['label']
        else:
          raise ValueError(label.tag)
    
        label = label.strip().rstrip(':').strip()
        self.db.execute('UPDATE preference SET label = ? WHERE id = ?', (label, pref.id))

    # options
    for menulist in self.pane.xpath('//menulist[@preference]'):
      options = menulist.xpath('.//menuitem')
      if len(options) == 0: continue # dynamic menu

      pref = self.get(id=menulist.attrib['preference'])
    
      for order, menuitem in enumerate(options):
        value = menuitem.attrib['value']
        if pref.type == 'number': value = int(value)
        self.db.execute('INSERT INTO option ("order", preference, value, label) VALUES (?, ?, ?, ?)', (order, pref.name, value, menuitem.attrib['label']))

    # overridable by auto-export
    for override in self.pane.xpath('//*[@ae-field]'):
      name = override.attrib['ae-field']
      self.db.execute('UPDATE preference SET override = ? WHERE name = ?', (True, name))

    # consistency checks
    for pref in self.all():
      if pref.hidden and pref.id: raise ValueError(f'{pref.name}: hidden + ID')
      if pref.hidden and pref.override: raise ValueError(f'{pref.name}: hidden + override')
      if pref.hidden and pref.section is not None: raise ValueError(f'{pref.name}: hidden + section')
      if not pref.hidden and pref.section is None: raise ValueError(f'{pref.name}: unassigned preference')

  def shortcodes(self):
    slugs = [section[0] for section in self.db.execute('SELECT slug FROM section ORDER BY "order"')] + ['hidden-preferences']
    for slug in slugs:
      content = "{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}\n"

      if slug == 'hidden-preferences':
        preferences = [pref for pref in self.all(options=list, section=str, order='name') if pref.hidden]
      else:
        preferences = [pref for pref in self.all(options=list, section=str) if pref.section == slug]

      for pref in preferences:
        if not pref.description: continue

        if pref.hidden:
          content += f"#### {pref.name}\n\n"
        else:
          content += f"#### {pref.label}\n\n"
    
        if pref.default == '':
          default = '<not set>'
        elif type(pref.default) == bool and pref.default:
          default = 'yes'
        elif type(pref.default) == bool:
          default = 'no'
        elif 'options' in pref:
          default = [o for o in pref.options if o.value == pref.default][0].label
        elif type(pref.default) == str:
          default = pref.default.replace('\u200B', '')
        else:
          default = pref.default
    
        content += f"default: `{default}`\n\n"
        content += pref.description + "\n\n"
    
        if 'options' in pref:
          content += "Options:\n\n"
          for option in pref.options:
            content += f"* {option.label}\n"
          content += "\n"
  
      shortcode = f'site/layouts/shortcodes/preferences/{slug}.md'
      os.makedirs(os.path.dirname(shortcode), exist_ok=True)
      print('  ' + shortcode)
      with open(shortcode, 'w') as f:
        print(content, file=f)

check_translations()
Preferences()
