#!/usr/bin/env python3

import json
from munch import Munch
import jsonpath_ng
import sqlite3
import re
import glob
from lxml import etree
import urllib.request
from urllib.error import HTTPError
from http.client import RemoteDisconnected
import os, sys
import mako
from mako.template import Template
from mako import exceptions

#root = os.path.join(os.path.dirname(__file__), '..')
root = os.path.dirname(__file__)

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

CSL = Munch(
  # https://citeproc-js.readthedocs.io/en/latest/csl-m/
  ignore = [ 'shortTitle', 'journalAbbreviation', 'abstract', 'note', 'annote', 'citation-label', 'citation-number', 'first-reference-note-number', 'keyword', 'locator', 'year-suffix' ]
)

DBNAME=':memory:'
DBNAME='mapping.sqlite'
if os.path.isfile(DBNAME): os.remove(DBNAME)
DB = sqlite3.connect(DBNAME)

DB.execute(f"CREATE TABLE _mapping (zotero, csl, type CHECK (type in ('text', 'date', 'name')))")

#  DB.execute(f'CREATE TABLE {table} (label, field, type, UNIQUE (label, field))')
#  DB.execute(f'''
#    CREATE TRIGGER {table}_type BEFORE INSERT ON {table} FOR EACH ROW
#    BEGIN
#      SELECT CASE WHEN EXISTS(SELECT 1 FROM {table} WHERE field = NEW.field AND type <> NEW.type) THEN
#        RAISE(FAIL, "Type conflict in {table}")
#      END;
#    END
#  ''')
DB.execute('CREATE TABLE _baseField (field NOT NULL, baseField NOT NULL)')
DB.execute('CREATE TABLE baseField (field NOT NULL, baseField NOT NULL, UNIQUE(field, baseField))')

DB.execute('CREATE TABLE _label (label NOT NULL, field NOT NULL)')
DB.execute('CREATE TABLE label (label NOT NULL, field NOT NULL, UNIQUE(label, field))')

with fetch('https://aurimasv.github.io/z2csl/typeMap.xml', 'typeMap.xml') as f:
  print('  parsing typemap')
  csl_map = etree.parse(f)
  # https://citeproc-js.readthedocs.io/en/latest/csl-m/
  CSL.type = {
    'document-name': 'standard',
    'committee': 'standard',
    'publication-number': 'number',
    'supplement': 'number',
    'volume-title': 'standard',
    'opening-date': 'date', # does not appear in the csl-m extension list, and not in typeMap.xml
    'publication-date': 'date',
    'testimonyBy': 'name', # does not appear in the csl-m extension list, and not in typeMap.xml
    'contributor': 'name', # does not appear in the cslCreatorMap
    'commenter': 'name', # does not appear in the cslCreatorMap
    'gazette-flag': 'standard',
  }
  for var in csl_map.xpath('//vars/var'):
    if var.attrib['name'] in CSL.ignore: continue
    CSL.type[var.attrib['name']] = var.attrib['type']
  for var in CSL.type.keys():
    CSL.type[var] = {'standard': 'text', 'number': 'text', 'date': 'date', 'name': 'name'}[CSL.type[var]]

  for var in csl_map.xpath('//cslCreatorMap/map'):
    c, z = [var.attrib['cslField'], var.attrib['zField']]
    if c in CSL.ignore: continue

    DB.execute(f'INSERT INTO _mapping (zotero, csl, type) VALUES (?, ?, ?)', (z, c, CSL.type[c]))

  for var in csl_map.xpath('//citeprocJStoCSLmap/remap'):
    c, z = [var.attrib['descKey'], var.attrib['citeprocField']]
    if c in CSL.ignore: continue

    CSL.type[z] = CSL.type[c]

    DB.execute(f'INSERT INTO _mapping (zotero, csl, type) VALUES (?, ?, ?)', (z, c, CSL.type[c]))

  for var in csl_map.xpath('//cslFieldMap/map'):
    c, z = [var.attrib['cslField'], var.attrib['zField']]
    if c in CSL.ignore: continue

    DB.execute(f'INSERT INTO _mapping (zotero, csl, type) VALUES (?, ?, ?)', (z, c, CSL.type[c]))

  DB.commit()

class jsonpath:
  finders = {}

  @classmethod
  def parse(cls, path):
    if not path in cls.finders: cls.finders[path] = jsonpath_ng.parse(path)
    return cls.finders[path]

with fetch('https://api.zotero.org/schema', 'zotero.json') as z, fetch('https://raw.githubusercontent.com/Juris-M/zotero-schema/master/schema-jurism.json', 'juris-m.json') as j:
  SCHEMA.zotero = Munch.fromDict(json.load(z))
  SCHEMA.jurism = Munch.fromDict(json.load(j))

  # Zotero
  ## missing date field
  SCHEMA.zotero.meta.fields.accessDate = Munch(type='date')

  ## status is publication status, not legal status
  SCHEMA.zotero.csl.fields.text.status = [ 'status' ]

  ## Juris-M
  # missing date field
  SCHEMA.jurism.meta.fields.accessDate = Munch(type='date')

  # missing variable mapping
  SCHEMA.jurism.csl.fields.text['volume-title'] = [ 'volumeTitle' ]

  # status is publication status, not legal status
  SCHEMA.jurism.csl.fields.text.status = [ 'status ']

  for source in ['zotero', 'jurism']:
    print('  parsing', source, 'schema')
    schema = SCHEMA[source]
    for field in [f.value for f in jsonpath.parse('itemTypes[*].fields[*]').find(schema)]:
      if field.get('baseField', field.field) in ['extra', 'abstractNote']: continue

      if 'baseField' in field:
        DB.execute('INSERT INTO _baseField(field, baseField) VALUES (?, ?)', (field.field, field.baseField))

      field = field.get('baseField', field.field)
      field_type = ([f.value for f in jsonpath.parse(f'meta.fields.{field}.type').find(schema)] + ['text'])[0]

      DB.execute('INSERT INTO _mapping (zotero, type) VALUES (?, ?)', (field, field_type))

    for field in [f.value for f in jsonpath.parse('itemTypes[*].creatorTypes[*].creatorType').find(schema)]:
      DB.execute('INSERT INTO _mapping (zotero, type) VALUES (?, ?)', (field, 'name'))

    for field in jsonpath.parse('csl.fields[*].*.*').find(schema):
      field_name = str(field.full_path).split('.')[-1]

      if field_name in CSL.ignore: continue

      DB.execute('INSERT INTO _mapping (csl, type) VALUES (?, ?)', (field_name, CSL.type[field_name]))

      zotero_fields = field.value
      if type(zotero_fields) == str: zotero_fields = [ zotero_fields ]

      for zotero_field in zotero_fields:
        DB.execute('INSERT INTO _mapping (csl, zotero, type) VALUES (?, ?, ?)', (field_name, zotero_field, CSL.type[field_name]))

    for field in jsonpath.parse('csl.names').find(schema):
      for zotero_field, field_name in field.value.items():
        assert CSL.type[field_name] == 'name'
        DB.execute('INSERT INTO _mapping (zotero, csl, type) VALUES (?, ?, ?)', (zotero_field, field_name, 'name'))

    DB.commit()

DB.execute('INSERT INTO baseField(field, baseField) SELECT DISTINCT field, baseField FROM _baseField')
DB.commit()

for row in DB.execute('SELECT zotero, csl FROM _mapping UNION SELECT field, baseField FROM baseField'):
  for field in row:
    if field is None: continue
    label = field.replace('_', ' ').replace('-', ' ')
    label = re.sub(r'([a-z])([A-Z])', r'\1 \2', label)
    label = label.lower()
    DB.execute('INSERT INTO _label (label, field) VALUES (?, ?)', (label, field))
DB.execute('INSERT INTO label(label, field) SELECT DISTINCT label, field FROM _label')
DB.commit()

print('  writing extra-fields')
query = '''
  SELECT label.label, _mapping.zotero, _mapping.csl, _mapping.type
  FROM _mapping
  JOIN label ON label.field IN (_mapping.zotero, _mapping.csl)

  UNION

  SELECT label.label, _mapping.zotero, _mapping.csl, _mapping.type
  FROM _mapping
  JOIN baseField ON baseField.baseField IN (_mapping.zotero, _mapping.csl)
  JOIN label ON label.field = baseField.field
'''
mapping = {}
for label, zotero, csl, field_type in DB.execute(query):
  if not label in mapping: mapping[label] = Munch(zotero=None, csl=None, type=field_type)
  assert mapping[label].type == field_type, (label, zotero, csl, field_type, mapping[label].type)
  for table in [('zotero', zotero), ('csl', csl)]:
    table, field = table
    if table == 'csl' and field in CSL.ignore: continue
    if field is None: continue
    if mapping[label][table] is None: mapping[label][table] = []
    mapping[label][table] = sorted(list(set(mapping[label][table] + [field])))

#for label, meta in mapping.items():
#  if meta.csl and len(meta.csl) > 1: print(label, 'csl:', meta.csl)
#  if meta.zotero and len(meta.zotero) > 1: print(label, 'zotero:', meta.zotero)

with open(os.path.join(GEN, 'extra-fields.json'), 'w') as f:
  json.dump(mapping, f, indent='  ')

print('  writing creators')
creators = {}
for itemType in jsonpath.parse('*.itemTypes[*]').find(SCHEMA):
  if not 'creatorTypes' in itemType.value or len(itemType.value.creatorTypes) == 0: continue
  if not itemType.value.itemType in creators: creators[itemType.value.itemType] = set()
  for creator in itemType.value.creatorTypes:
    creators[itemType.value.itemType].add(creator.creatorType)
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

    if not itemType.value in valid.type:
      valid.type[itemType.value] = client
      valid.field[itemType.value] = {}
    elif valid.type[itemType.value] != client:
      valid.type[itemType.value] = 'true'

  for itemType in jsonpath.parse('*.itemTypes[*]').find(SCHEMA):
    client = str(itemType.full_path).split('.')[0]
    for field in itemType.value.fields:
      field = field.get('baseField', field.field)

      if not field in valid.field[itemType.value.itemType]:
        valid.field[itemType.value.itemType][field] = client
      elif valid.field[itemType.value.itemType][field] != client:
        valid.field[itemType.value.itemType][field] = 'true'

  DB.execute('CREATE TABLE _alias (field, alias, client)')
  DB.execute('CREATE TABLE alias (field, alias, client)')
  for field in jsonpath.parse('*.itemTypes[*].fields[*]').find(SCHEMA):
    if not 'baseField' in field.value: continue
    client = str(field.full_path).split('.')[0]
    DB.execute('INSERT INTO _alias (field, alias, client) VALUES (?, ?, ?)', (field.value.baseField, field.value.field, client))
  DB.execute('INSERT INTO alias (field, alias, client) SELECT DISTINCT field, alias, client FROM _alias')
  DB.commit()
  aliases = Munch()
  for field, alias, client in DB.execute("SELECT field, alias, GROUP_CONCAT(client, '+') FROM alias GROUP BY field, alias"):
    if '+' in client: client = 'both'
    if not client in aliases: aliases[client] = Munch()
    if not field in aliases[client]: aliases[client][field] = []
    aliases[client][field].append(alias)

  try:
    print(template('items/fields.ts.mako').render(valid=valid, aliases=aliases).strip(), file=f)
  except:
    print(exceptions.text_error_template().render())
