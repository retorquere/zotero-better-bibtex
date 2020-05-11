#!/usr/bin/env python3

from http.client import RemoteDisconnected
from lxml import etree
from mako import exceptions
from mako.template import Template
from munch import Munch
from urllib.error import HTTPError
import glob
import json, jsonpatch, jsonpath_ng
import mako
import networkx as nx
import os, sys
import re
import sys
import urllib.request

root = os.path.join(os.path.dirname(__file__), '..')

print('parsing Zotero/Juris-M schemas')
SCHEMA = Munch(root = os.path.join(root, 'schema'))
GEN = os.path.join(root, 'gen/items')
TYPINGS = os.path.join(root, 'gen/typings')

os.makedirs(SCHEMA.root, exist_ok=True)
os.makedirs(GEN, exist_ok=True)
os.makedirs(TYPINGS, exist_ok=True)

class fetch(object):
  def __init__(self, url, name):
    print('  * fetching', url)
    self.url = url
    self.name = name

  def __enter__(self):
    request = urllib.request.Request(self.url)
    request.get_method = lambda: 'HEAD'
    try:
      with urllib.request.urlopen(request) as r:
        etag = r.getheader('ETag')
        if etag.startswith('W/'): etag = etag[2:]
        etag = json.loads(etag) # strips quotes
        name  = f'{etag}-{self.name}'
    except (HTTPError, RemoteDisconnected):
      print(' ', self.url, 'timed out, falling back to cached version')
      name = os.path.basename(glob.glob(os.path.join(SCHEMA.root, f'*-{self.name}'))[0])
    try:
      self.f = open(os.path.join(SCHEMA.root, name))
      return self.f
    except FileNotFoundError:
      print(name, f'does not exist, get with "curl -Lo schema/{name} {self.url}"')
      sys.exit(1)

  def __exit__(self, type, value, traceback):
    self.f.close()

class jsonpath:
  finders = {}

  @classmethod
  def parse(cls, path):
    if not path in cls.finders: cls.finders[path] = jsonpath_ng.parse(path)
    return cls.finders[path]

def patch(s, p):
  with open(os.path.join(SCHEMA.root, p)) as f:
    return jsonpatch.apply_patch(s, json.load(f))

class ExtraFields:
  def __init__(self):
    self.dg = nx.DiGraph()
    self.color = Munch(
      zotero='#FF0000',
      csl='#99CC00',
      label='#33cccc'
    )

  def make_label(self, field):
    label = field.replace('_', ' ').replace('-', ' ')
    label = re.sub(r'([a-z])([A-Z])', r'\1 \2', label)
    label = label.lower()
    return label

  def add_label(self, domain, name, label):
    assert domain in ['csl', 'zotero']
    assert type(name) == str
    assert type(label) == str

    self.dg.add_node(f'label:{label}', domain='label', name=label, graphics={'fill': self.color.label})
    self.dg.add_edge(f'label:{label}', f'{domain}:{name}', graphics={ 'targetArrow': 'standard' })

  def add_mapping(self, f, t, reverse=True):
    mappings = [(f, t)]
    if reverse: mappings.append((t, f))
    for f, t in mappings:
      self.dg.add_edge(':'.join(f), ':'.join(t), graphics={ 'targetArrow': 'standard' })

  def add_var(self, domain, name, tpe):
    assert domain in ['csl', 'zotero']
    assert type(name) == str
    assert tpe in ['name', 'date', 'text']

    self.dg.add_node(f'{domain}:{name}', domain=domain, name=name, type=tpe, graphics={'fill': self.color[domain]})
    self.add_label(domain, name, name)
    self.add_label(domain, name, self.make_label(name))

  def load(self, schema):
    typeof = {}
    for field, meta in schema.meta.fields.items():
      typeof[field] = meta.type
  
    for field in jsonpath.parse('$.itemTypes[*].fields[*]').find(schema):
      baseField = field.value.get('baseField', None)
      field = field.value.get('baseField', field.value.field)

      self.add_var('zotero', field, typeof.get(field, 'text'))
      if baseField:
        self.add_label('zotero', field, baseField)
        self.add_label('zotero', field, self.make_label(baseField))

    for field in jsonpath.parse('$.itemTypes[*].creatorTypes[*].creatorType').find(schema):
      self.add_var('zotero', field.value, 'name')

    for fields in jsonpath.parse('$.csl.fields.text').find(schema):
      for csl, zotero in fields.value.items():
        self.add_var('csl', csl, 'text')
        for field in zotero:
          self.add_var('zotero', field, 'text')
          self.add_mapping(('csl', csl), ('zotero', field))

    for fields in jsonpath.parse('$.csl.fields.date').find(schema):
      for csl, zotero in fields.value.items():
        self.add_var('csl', csl, 'date')
        if type(zotero) == str: zotero = [zotero] # juris-m has a list here, zotero strings
        for field in zotero:
          self.add_var('zotero', field, 'date')
          self.add_mapping(('csl', csl), ('zotero', field))

    for zotero, csl in schema.csl.names.items():
      self.add_var('csl', csl, 'name')
      self.add_var('zotero', zotero, 'name')
      self.add_mapping(('csl', csl), ('zotero', zotero))

    for field, tpe in schema.csl.unmapped.items():
      self.add_var('csl', field, tpe)

    for alias, field in schema.csl.alias.items():
      self.add_label('csl', field, alias)
      self.add_label('csl', field, self.make_label(alias))

  def multiple_incoming(self, var_nodes):
    for node in var_nodes:
      edges = [(u, v) for u, v in self.dg.in_edges(node) if u in var_nodes]
      if len(edges) > 1: return edges
    return None

  def save(self, path):
    stringizer = lambda x: self.dg.nodes[x]['name'] if x in self.dg.nodes else x
    nx.write_gml(self.dg, 'mapping.gml', stringizer)

    # remove multi-line text fields
    ignore = [
      'zotero.abstractNote',
      'zotero.extra',
      'csl.abstract',
      'csl.note',
    ]
    for node, data in list(self.dg.nodes(data=True)):
      if data['domain'] + '.' + data['name'] in ignore:
        self.dg.remove_node(node)

    # remove multi-incoming because that mapping incurs data loss
    var_nodes = [n for n in self.dg.nodes if self.dg.nodes[n]['domain'] in ['csl', 'zotero']]
    while edges := self.multiple_incoming(var_nodes):
      for u, v in edges:
        self.dg.remove_edge(u, v)
    nx.write_gml(self.dg, 'mapping-remove-ambiguous.gml', stringizer)

    # add labels through translation
    for label, data in self.dg.nodes(data=True):
      if data['domain'] != 'label': continue

      # make sure a label points to only one zotero/csl field
      out_nodes = [ out_edge[1] for out_edge in self.dg.out_edges(label) ]
      domains = {}
      for domain in ['zotero', 'csl']:
        domains[domain] = len([0 for node in out_nodes if self.dg.nodes[node]['domain'] == domain])
        assert domains[domain] < 2

      # label points to both or none
      if sum(domains.values()) != 1: continue
      for _, node in self.dg.out_edges(out_nodes[0]):
        self.dg.add_edge(label, node, graphics={ 'targetArrow': 'standard' })

    nx.write_gml(self.dg, 'mapping-full-labels.gml', stringizer)

    mapping = {}
    for label, data in self.dg.nodes(data=True):
      if data['domain'] != 'label': continue
      name = data['name']

      for _, var in self.dg.out_edges(label):
        var = self.dg.nodes[var]
        if not name in mapping: mapping[name] = {}
        assert 'type' not in mapping[name] or mapping[name]['type'] == var['type']
        mapping[name]['type'] = var['type']

        domain = var['domain']
        if not domain in mapping[name]: mapping[name][domain] = []
        mapping[name][domain].append(var['name'])

    # ensure names don't get mapped to multiple fields
    for var, mapped in mapping.items():
      if mapped['type'] != 'name': continue
      assert len(mapped.get('zotero', [])) <= 1, var
      assert len(mapped.get('csl', [])) <= 1, var

    with open(path, 'w') as f:
      json.dump(mapping, f, sort_keys=True, indent='  ')

print('  writing extra-fields')
with fetch('https://api.zotero.org/schema', 'zotero.json') as z, fetch('https://raw.githubusercontent.com/Juris-M/zotero-schema/master/schema-jurism.json', 'juris-m.json') as j:
  ef = ExtraFields()

  SCHEMA.zotero = Munch.fromDict(patch(json.load(z), 'schema.patch'))
  ef.load(SCHEMA.zotero)

  SCHEMA.jurism = Munch.fromDict(patch(json.load(j), 'schema.patch'))
  ef.load(SCHEMA.jurism)
  ef.save(os.path.join(GEN, 'extra-fields.json'))

print('  writing creators')
creators = {'zotero': {}, 'jurism': {}}
for itemType in jsonpath.parse('*.itemTypes[*]').find(SCHEMA):
  if not 'creatorTypes' in itemType.value or len(itemType.value.creatorTypes) == 0: continue

  client = str(itemType.full_path).split('.')[0]

  if not itemType.value.itemType in creators[client]: creators[client][itemType.value.itemType] = set()
  for creator in itemType.value.creatorTypes:
    creators[client][itemType.value.itemType].add(creator.creatorType)
with open(os.path.join(GEN, 'creators.json'), 'w') as f:
  json.dump(creators, f, indent='  ', default=lambda x: list(x))

def template(tmpl):
  return Template(filename=os.path.join(root, 'setup/templates', tmpl))

print('  writing typing for serialized item')
with open(os.path.join(TYPINGS, 'serialized-item.d.ts'), 'w') as f:
  fields = sorted(list(set(field.value.get('baseField', field.value.field) for field in jsonpath.parse('*.itemTypes[*].fields[*]').find(SCHEMA))))
  print(template('items/serialized-item.d.ts.mako').render(fields=fields).strip(), file=f)

print('  writing field simplifier')
with open(os.path.join(GEN, 'fields.ts'), 'w') as f:
  valid = Munch(type={}, field={})
  for itemType in jsonpath.parse('*.itemTypes[*].itemType').find(SCHEMA):
    client = str(itemType.full_path).split('.')[0]
    itemType = itemType.value

    if not itemType in valid.type:
      valid.type[itemType] = client
      if itemType == 'note':
        valid.field[itemType] = {field: 'true' for field in 'itemType tags note id itemID dateAdded dateModified'.split(' ')}
      elif itemType == 'attachment':
        valid.field[itemType] = {field: 'true' for field in 'itemType tags id itemID dateAdded dateModified'.split(' ')}
      else:
        valid.field[itemType] = {field: 'true' for field in 'itemType creators tags attachments notes seeAlso id itemID dateAdded dateModified multi'.split(' ')}
    elif valid.type[itemType] != client:
      valid.type[itemType] = 'true'

  for itemType in jsonpath.parse('*.itemTypes[*]').find(SCHEMA):
    client = str(itemType.full_path).split('.')[0]
    for field in itemType.value.fields:
      field = field.get('baseField', field.field)

      if not field in valid.field[itemType.value.itemType]:
        valid.field[itemType.value.itemType][field] = client
      elif valid.field[itemType.value.itemType][field] != client:
        valid.field[itemType.value.itemType][field] = 'true'

  DG = nx.DiGraph()
  for field in jsonpath.parse('*.itemTypes[*].fields[*]').find(SCHEMA):
    if not 'baseField' in field.value: continue
    client = str(field.full_path).split('.')[0]
    field = field.value

    if not (data := DG.get_edge_data(field.field, field.baseField, default=None)):
      DG.add_edge(field.field, field.baseField, client=client)
    elif data['client'] != client:
      DG.edges[field.field, field.baseField]['client'] = 'both'

  aliases = {}
  for field, baseField, client in DG.edges.data('client'):
    if not client in aliases: aliases[client] = {}
    if not baseField in aliases[client]: aliases[client][baseField] = []
    aliases[client][baseField].append(field)

  try:
    print(template('items/fields.ts.mako').render(valid=valid, aliases=aliases).strip(), file=f)
  except:
    print(exceptions.text_error_template().render())
