#!/usr/bin/env python3

from lxml import etree, sax
from munch import Munch
from slugify import slugify
import textwrap
import json
from collections import OrderedDict
import os
import html
from mako.template import Template

root = os.path.join(os.path.dirname(__file__), '..')

def template(tmpl):
  return Template(filename=os.path.join(os.path.dirname(os.path.realpath(__file__)), 'templates', tmpl))

def jstype(v):
  if type(v) == bool: return 'boolean'
  if type(v) == str: return 'string'
  if type(v) == int: return 'number'
  raise ValueError(f'Unexpected type {type(v)}')

def load(name):
  with open(name) as f:
      xul = f.read()
  with open(os.path.join(root, 'locale/en-US/zotero-better-bibtex.dtd')) as dtd:
    for entity in etree.DTD(dtd).entities():
      xul = xul.replace(f'&{entity.name};', entity.content)
  xul = etree.fromstring(xul)
  ns = Munch()
  for name, url in xul.nsmap.items():
    if not name: name = 'xul'
    ns[name] = url
  return xul, ns

class Preferences:
  def __init__(self):
    self.preferences = {}
    self.hidden = {}
    self.undocumented = {}
    self.printed = []

    self.pane, self.ns = load(os.path.join(root, 'content/Preferences.xul'))
    self.parse()
    self.save()

  def parse(self):
    xul = f'{{{self.ns.xul}}}'
    bbt = f'{{{self.ns.bbt}}}'
    prefix = 'extensions.zotero.translators.better-bibtex.'

    #for doc in self.pane.findall(f'.//{xul}prefpane/{bbt}doc'):
    #  self.header = textwrap.dedent(doc.text)

    tooltips = {}
    links = {
      'which is not all of them': 'support/faq#why-the-double-braces',
      'title casing for English references': 'support/faq#bbt-is-changing-the-capitalization-of-my-titles-why',
      'automatic brace-protection for words with uppercase letters': 'support/faq#why-the-double-braces'
    }
    for tooltip in self.pane.findall(f'.//{xul}popupset/{xul}tooltip/{xul}description'):
      tooltips[tooltip.getparent().get('id').replace('tooltip-', '')] = tooltip
      for text, link in list(links.items()):
        if text in tooltip.text:
          tooltip.text = tooltip.text.replace(text, f'[{text}]({{{{ ref . "{link}" }}}})')
          links.pop(text)
    if len(links) > 0: raise ValueError(', '.join(list(links.keys())))

    for pref in self.pane.findall(f'.//{xul}prefpane/{xul}preferences/{xul}preference'):

      doc = pref.getnext()
      if doc is not None and doc.tag != f'{bbt}doc': doc = None
      if doc is None: doc = tooltips.get(pref.get('name').split('.')[-1])

      _id = pref.get('id')
      pref = Munch(
        name = pref.get('name').replace(prefix, ''),
        type = pref.get('type'),
        default = pref.get('default')
      )
      if doc is not None: pref.description = textwrap.dedent(doc.text).strip()
      self.preferences[_id or f'#{pref.name}'] = pref

      self.hidden[pref.name] = _id is None
      self.undocumented[pref.name] = 'description' not in pref

      if pref.type == 'bool':
        pref.type = 'boolean'
        pref.default = (pref.default == 'true')
      elif pref.type == 'int':
        pref.type = 'number'
        pref.default = int(pref.default)

    # order matters -- bbt:preference last
    for pref in self.pane.findall(f'.//*[@preference]') + self.pane.findall(f'.//*[@{bbt}preference]'):
      _id = pref.get(f'{bbt}preference') or pref.get('preference')
      if pref.tag == f'{xul}label':
        label = pref.text
      else:
        label = pref.get('label')
      if label:
        self.preferences[_id].label = label

    for options in self.pane.findall(f'.//{xul}menulist[@preference]'):
      pref = self.preferences[options.get('preference')]
      pref.options = OrderedDict()
      for option in options.findall(f'.//{xul}menuitem'):
        value = option.get('value')
        if pref.type == 'number': value = int(value)
        pref.options[value] = option.get('label')

    for override in self.pane.findall(f'.//*[@{bbt}ae-field]'):
      override = override.get(f'{bbt}ae-field')
      override = next((pref for pref in self.preferences.values() if pref.name == override), None)
      if override: override.override = True

    self.preferences['#skipWords'].default = self.preferences['#skipWords'].default.replace(' ', '')

    sections = [section.get('label') for section in self.pane.findall(f'.//{xul}prefwindow/{xul}prefpane/{xul}tabbox/{xul}tabs/{xul}tab')]
    sections.append('Hidden preferences')

    for panel in self.pane.findall(f'.//{xul}prefwindow/{xul}prefpane/{xul}tabbox/{xul}tabpanels/{xul}tabpanel'):
      self.tabs = [tab.get('label') for tab in panel.findall(f'.//{xul}tab')]
      with open(os.path.join(root, 'site/layouts/shortcodes/preferences', f'{slugify(sections.pop(0))}.md'), 'w') as f:
        print('{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}', file=f)

        print(self.doc(panel), file=f)

    with open(os.path.join(root, f'site/layouts/shortcodes/preferences/{slugify(sections.pop(0))}.md'), 'w') as f:
      print('{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}', file=f)

      doc = ''
      for pref in sorted(self.preferences.keys()):
        pref = self.preferences[pref]
        if pref.name not in self.hidden: continue
        if pref.name not in self.undocumented: continue

        doc += self.pref(pref)
      print(doc, file=f)

  def doc(self, node, section=False):
    xul = f'{{{self.ns.xul}}}'
    bbt = f'{{{self.ns.bbt}}}'

    doc = ''
    pref = node.get('preference') or node.get(f'{bbt}preference')
    if pref is not None:
      doc += self.pref(self.preferences[pref])

    for child in node:
      if child.tag == f'{xul}groupbox':
        label = child.find(f'./{xul}caption').get(f'label')
      elif child.tag == f'{xul}tabpanel':
        label = self.tabs.pop(0)
      else:
        label = None

      child = self.doc(child, section or label is not None)
      if child.strip() == '': continue

      #if label: doc += '<fieldset><legend>\n\n' + html.escape(label) + '\n\n</legend>\n\n'
      if not section and label: doc += f'### {label}\n\n'
      doc += child
      #if label: doc += '</fieldset>\n\n'

    return doc

  def pref(self, pref):
    if pref.name in self.printed: return ''
    if not 'description' in pref: return ''

    self.printed.append(pref.name)

    if 'label' in pref:
      doc = f'#### {pref.label}\n\n'
    else:
      doc = f'### {pref.name}\n\n' # hidden pref

    dflt = pref.default
    if 'options' in pref:
      dflt = pref.options[dflt]
    elif pref.type == 'boolean':
      dflt = 'yes' if dflt else 'no'
    elif pref.type == 'string' and dflt == '':
      dflt = '<not set>'
    doc += f'default: `{dflt}`\n\n'

    doc += pref.description + '\n\n'

    if 'options' in pref:
      doc += 'Options:\n\n'
      for option in pref.options.values():
        doc += f'* {option}\n'
      doc += '\n'

    return doc

  def save(self):
    preferences = {}
    for pref in self.preferences.values():
      assert (pref.name in self.printed) or (pref.name in self.undocumented), f'{pref.name} not printed'
      preferences[pref.name] = pref
      del pref['name']

    os.makedirs(os.path.join(root, 'gen/preferences'), exist_ok=True)

    with open(os.path.join(root, 'gen/preferences/preferences.json'), 'w') as f:
      json.dump(preferences, f, indent=2)

    for f in ['gen/preferences/defaults.json', 'site/data/preferences/defaults.json']:
      with open(os.path.join(root, f), 'w') as f:
        dflts = { name: pref.default for (name, pref) in preferences.items() }
        json.dump(dflts, f, indent=2)

    with open(os.path.join(root, 'gen/preferences/auto-export-overrides.json'), 'w') as fo:
      with open(os.path.join(root, 'gen/preferences/auto-export-overrides-schema.json'), 'w') as fos:
        override = {}
        for name, pref in preferences.items():
          if not 'override' in pref: continue
          if 'options' in pref:
            override[name] = { 'enum': list(pref.options.keys()) }
          else:
            override[name] = { 'type': pref.type }
        json.dump(override, fos, indent=2)
      json.dump(list(override.keys()), fo, indent=2)

    os.makedirs(os.path.join(root, 'gen/typings'), exist_ok=True)

    with open(os.path.join(root, 'gen', 'typings', 'preferences.d.ts'), 'w') as f:
      print('interface IPreferences {', file=f)
      for name, pref in preferences.items():
        print(f'  {name}: {pref.type}', file=f)
      print('}', file=f)

    with open(os.path.join(root, 'gen', 'preferences.ts'), 'w') as f:
      print(template('preferences/preferences.ts.mako').render(preferences=preferences).strip(), file=f)

content = os.path.join(root, 'content')
for xul in os.listdir(content):
  if xul.endswith('xul'): load(os.path.join(content, xul))

Preferences()
