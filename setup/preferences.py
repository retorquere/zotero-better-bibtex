#!/usr/bin/env python3

from lxml import etree
from munch import Munch
from slugify import slugify
import textwrap
import json
from collections import OrderedDict
import os, sys
import html
from mako.template import Template
import re
from glob import glob
import frontmatter
from types import SimpleNamespace

if os.system('setup/preferences.js') != 0:
  print('unpug failed')
  sys.exit(1)

root = os.path.join(os.path.dirname(__file__), '..')

def template(tmpl):
  return Template(filename=os.path.join(os.path.dirname(os.path.realpath(__file__)), 'templates', tmpl))

def jstype(v):
  if type(v) == bool: return 'boolean'
  if type(v) == str: return 'string'
  if type(v) == int: return 'number'
  raise ValueError(f'Unexpected type {type(v)}')

def load(path):
  #for lang in [l for l in os.listdir(os.path.join(root, 'locale')) if l != 'en-US'] + ['en-US']: # make sure en-US is loaded last for the website
  for lang in ['en-US']:
    #print(f'  {os.path.basename(path)} {lang}')
    with open(path) as f:
        xul = f.read()
    with open(os.path.join(root, f'locale/{lang}/zotero-better-bibtex.dtd')) as dtd:
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
    self.vars = []

    self.pane, self.ns = load(os.path.join(root, 'content/Preferences.xul'))
    self.parse()
    self.doc()
    self.save()

  def parse(self):
    xul = f'{{{self.ns.xul}}}'
    bbt = f'{{{self.ns.bbt}}}'
    self.prefix = 'extensions.zotero.translators.better-bibtex.'

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

    self.translators = {}
    for tr in glob('translators/*.json'):
      with open(tr) as f:
        tr = Munch.fromDict(json.load(f))
        self.translators[tr.label] = tr
        tr.keepUpdated = 'displayOptions' in tr and 'keepUpdated' in tr.displayOptions
        tr.cached = tr.label.startswith('Better ') and not 'Quick' in tr.label
        tr.affectedBy = []
    for pref in self.pane.findall(f'.//{xul}prefpane/{xul}preferences/{xul}preference'):
      affected = []
      for affects in pref.get(f'{bbt}affects').split():
        if affects == '':
          pass
        elif affects == '*':
          affected += [tr.label for tr in self.translators.values() if 'Better ' in tr.label and not 'Quick' in tr.label]
        elif affects in ['tex', 'bibtex', 'biblatex', 'csl']:
          affected += [tr.label for tr in self.translators.values() if 'Better ' in tr.label and not 'Quick' in tr.label and affects in tr.label.lower()]
        else:
          raise ValueError(affects)
      affects = sorted(list(set(affected)))

      doc = pref.getnext()
      pref = Munch(
        id = pref.get('id'),
        name = pref.get('name').replace(self.prefix, ''),
        type = pref.get('type'),
        default = pref.get('default'),
        affects = affects
      )
      pref.var = re.sub(r'-(.)', lambda m: m.group(1).upper(), pref.name.replace('.', '_'))
      assert pref.var not in self.vars, pref.var
      self.vars.append(pref.var)

      for tr in affects:
        self.translators[tr].affectedBy.append(pref.var)

      # temporary
      assert pref.name == pref.var, (pref.name, pref.var)

      self.hidden[pref.name] = pref.id is None
      self.preferences[pref.id or f'#{pref.name}'] = pref

      while doc is not None and doc.tag in [f'{bbt}option', f'{bbt}doc']:
        if doc.tag == f'{bbt}option':
          assert pref.id is None, pref.id
          assert pref.type == 'string'
          pref.options = OrderedDict()
          self.undocumented[pref.name] = True
          while doc is not None and doc.tag == f'{bbt}option':
            value = doc.get('value')
            pref.options[value] = value
            doc = doc.getnext()
          continue

        elif doc.tag == f'{bbt}doc':
          pref.description = textwrap.dedent(doc.text).strip()

        doc = doc.getnext()

      if not 'description' in pref:
        if (doc := tooltips.get(pref.get('name', '').split('.')[-1])) is not None:
          pref.description = textwrap.dedent(doc.text).strip()

      if 'description' in pref:
        pref.description = pref.description.replace('\n\n', '\t').replace('\n', ' ').replace('\t', '\n\n')

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
      if label := pref.get('label'):
        self.preferences[_id].label = label
      else:
        self.preferences[_id].label = pref.text

    for options in self.pane.findall(f'.//{xul}menulist[@preference]'):
      pref = self.preferences[options.get('preference')]
      pref.options = OrderedDict()
      for option in options.findall(f'.//{xul}menuitem'):
        value = option.get('value')
        if pref.type == 'number': value = int(value)
        pref.options[value] = option.get('label')
    for options in self.pane.findall(f'.//{xul}radiogroup[@preference]'):
      pref = self.preferences[options.get('preference')]
      pref.options = OrderedDict()
      for option in options.findall(f'.//{xul}radio'):
        value = option.get('value')
        if pref.type == 'number': value = int(value)
        pref.options[value] = option.get('label')

    for override in self.pane.findall(f'.//*[@{bbt}ae-field]'):
      override = override.get(f'{bbt}ae-field')
      if override in ['type', 'name', 'status', 'updated', 'translator', 'path', 'error', 'cacherate', 'recursive']:
        continue
      if override in ['exportNotes', 'useJournalAbbreviation']:
        continue
      pref = next((pref for pref in self.preferences.values() if pref.name == override), None)
      assert pref, f'could not find pref with name {override}'
      pref.override = True

    self.preferences['#skipWords'].default = self.preferences['#skipWords'].default.replace(' ', '')

  def doc(self):
    xul = f'{{{self.ns.xul}}}'
    bbt = f'{{{self.ns.bbt}}}'

    page = SimpleNamespace(root='site/content/installation/preferences')
    page.pages = set([os.path.splitext(os.path.basename(p))[0] for p in glob(os.path.join(page.root, '*.md'))])

    hidden = 'hidden-preferences'
    doc = SimpleNamespace(weight=9, pages={hidden: frontmatter.load(os.path.join(page.root, hidden + '.md'))})
    doc.pages[hidden].metadata['weight'] = doc.weight + len(page.pages)

    def gettabs(node, path):
      for tabs in [f'{path}/{xul}tabs/{xul}tab', f'{path}/{xul}arrowscrollbox/{xul}tabs/{xul}tab']:
        tabs = node.findall(tabs)
        if len(tabs) > 0: break
      panels = node.findall(f'{path}/{xul}tabpanels/{xul}tabpanel')
      assert len(tabs) == len(panels), (len(tabs), len(panels), etree.tostring(node[1], pretty_print=True).decode('utf-8'))
      return zip(tabs, panels)

    # prepare labels
    index = False
    for tab, panel in gettabs(self.pane, f'.//{xul}prefwindow/{xul}prefpane/{xul}tabbox'):
      panel.attrib[f'{bbt}label'] = tab.attrib['label']

      if not index:
        panel.attrib[f'{bbt}page'] = '_index'
        index = True

      assert panel.attrib[f'{bbt}page'] in page.pages, (panel.attrib, page.pages)
      page.pages.remove(panel.attrib[f'{bbt}page'])

      for subtab, subpanel in gettabs(panel, f'./{xul}tabbox'):
        subpanel.attrib[f'{bbt}label'] = subtab.attrib['label']
    assert list(page.pages) == [hidden], page.pages

    for groupbox in self.pane.findall(f'.//{xul}groupbox'):
      if len(groupbox) > 0 and groupbox[0].tag == f'{xul}caption':
        groupbox.attrib[f'{bbt}label'] = groupbox[0].get('label') or groupbox[0].text

    def walk(node, level=None):
      levelup = 0

      if (node.tag == f'{xul}tabpanel') and (pagename := node.get(f'{bbt}page')):
        level = None
        doc.weight += 1
        doc.pages[pagename] = frontmatter.load(os.path.join(page.root, pagename + '.md'))
        doc.pages[pagename].content = '{{% preferences/header %}}\n\n'
        doc.pages[pagename].metadata['title'] = node.attrib[f'{bbt}label']
        doc.pages[pagename].metadata['weight'] = doc.weight
        doc.current = pagename

      elif (node.tag in [f'{xul}tabpanel', f'{xul}groupbox']) and (label := node.get(f'{bbt}label')):
        levelup = 1
        doc.pages[doc.current].content += ('#' * (level + 2)) + ' ' + label + '\n\n'

      elif pref := node.get('preference'):
        doc.pages[doc.current].content += self.pref(self.preferences[pref], level + 2)

      for child in node:
        walk(child, (level or 0) + levelup)

    walk(self.pane)

    doc.pages['hidden-preferences'].content = "{{% preferences/header %}}\n\nThe following settings are not exposed in the UI, but can be found under `Preferences`/`Advanced`/`Config editor`. Zotero knows these as [hidden parameters](https://www.zotero.org/support/preferences/hidden_preferences).\n\n"

    for pref in sorted(self.preferences.keys()):
      pref = self.preferences[pref]
      if pref.name not in self.hidden: continue
      if pref.name not in self.undocumented: continue

      doc.pages['hidden-preferences'].content += self.pref(pref, 2)

    for name, content in doc.pages.items():
      with open(os.path.join(page.root, name + '.md'), 'wb') as f:
        frontmatter.dump(content, f)

  def pref(self, pref, level):
    if pref.name in self.printed: return ''
    if not 'description' in pref: return ''

    self.printed.append(pref.name)

    if 'label' in pref:
      doc = ('#' * level) + f' {pref.label}\n\n'
    else:
      doc = ('#' * level) + f' {pref.name}\n\n' # hidden pref

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
    for pref in self.preferences.values():
      assert (pref.name in self.printed) or (pref.name in self.undocumented), f'{pref.name} not printed'

    os.makedirs(os.path.join(root, 'gen'), exist_ok=True)
    preferences = sorted(self.preferences.values(), key=lambda pref: pref.name)
    for pref in preferences:
      if 'id' in pref:
        del pref['id']

    with open(os.path.join(root, 'test/features/steps/preferences.json'), 'w') as f:
      json.dump([{ k: v for k, v in pref.items() if k != 'description'} for pref in preferences], f, indent=2)

    with open(os.path.join(root, 'site/data/preferences/defaults.json'), 'w') as f:
      json.dump({ pref.name: pref.default for pref in preferences }, f, indent=2)

    os.makedirs(os.path.join(root, 'build/defaults/preferences'), exist_ok=True)
    with open(os.path.join(root, 'build/defaults/preferences/defaults.js'), 'w') as f:
      for pref in preferences:
        print(f'pref({json.dumps(self.prefix + pref.name)}, {json.dumps(pref.default)})', file=f)

    # last because we're adding support data to the prefs
    preferences = sorted(preferences, key=lambda pref: str.casefold(pref.var))
    for pref in preferences:
      if 'options' in pref:
        pref.valid = ' | '.join([ json.dumps(option) for option in pref.options ])
        pref.quoted_options = json.dumps(list(pref.options.keys()))
      else:
        pref.valid = pref.type

    names = [pref.var for pref in preferences]

    translators = self.translators.values()
    with open(os.path.join(root, 'gen', 'preferences.ts'), 'w') as f:
      print(template('preferences/preferences.ts.mako').render(prefix=self.prefix, names=names, translators=translators, preferences=preferences).strip(), file=f)

    meta = os.path.join(root, 'gen', 'preferences', 'meta.ts')
    os.makedirs(os.path.dirname(meta), exist_ok=True)
    with open(meta, 'w') as f:
      print(template('preferences/meta.ts.mako').render(prefix=self.prefix, names=names, translators=translators, preferences=preferences).strip(), file=f)

content = os.path.join(root, 'content')
for xul in os.listdir(content):
  if xul.endswith('xul'):
    print(' ', xul)
    load(os.path.join(content, xul))

Preferences()
