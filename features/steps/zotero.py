import json
import os
import urllib
import tempfile
from munch import *
import difflib
import shutil
import io
from markdownify import markdownify as md
from bs4 import BeautifulSoup

from ruamel.yaml import YAML
yaml = YAML(typ='safe')
yaml.default_flow_style = False

ROOT = os.path.join(os.path.dirname(__file__), '../..')
with open(os.path.join(ROOT, 'gen/translators.json')) as f:
  TRANSLATORS = json.load(f, object_hook=Munch)

class Client:
  def __init__(self, config):
    self.id = config.userdata.get('zotero', 'zotero')
    if self.id == 'zotero':
      self.port = 23119
    elif self.id == 'jurism':
      self.port = 24119
    else:
      raise ValueError(f'Unexpected client "{config.userdata.zotero}"')

    self.zotero = self.id == 'zotero'
    self.jurism = self.id == 'jurism'

    self.timeout = int(config.userdata.get('timeout', 60))

    print(self)

  def __str__(self):
    return f'{self.id}: port={self.port}, timeout={self.timeout}'

client = None

def assert_equal_diff(expected, found):
  assert expected == found, '\n' + '\n'.join(difflib.unified_diff(expected.split('\n'), found.split('\n'), fromfile='expected', tofile='found', lineterm=''))

def html2md(html):
  html = BeautifulSoup(html).prettify()
  return md(html).strip()

def serialize(obj):
  return json.dumps(obj, indent=2, sort_keys=True)

def un_multi(obj):
  if type(obj) == dict:
    obj.pop('multi', None)
    for v in obj.values():
      un_multi(v)
  elif type(obj) == list:
    for v in obj:
      un_multi(v)

def strip_obj(data):
  if type(data) == list:
    stripped = [strip_obj(e) for e in data]
    return [e for e in stripped if e not in ['', u'', {}, None, []]]

  if type(data) == dict:
    stripped = {k: strip_obj(v) for (k, v) in data.items()}
    return {k: v for (k, v) in stripped.items() if v not in ['', u'', {}, None, []]}

  return data

def normalizeJSON(lib):
  un_multi(lib)

  lib.pop('config', None)
  lib.pop('keymanager', None)
  lib.pop('cache', None)

  itemIDs = {}
  for itemID, item in enumerate(lib['items']):
    itemIDs[item['itemID']] = itemID
    item['itemID'] = itemID

    item.pop('dateAdded', None)
    item.pop('dateModified', None)
    item.pop('uniqueFields', None)
    item.pop('key', None)
    item.pop('citekey', None)
    item.pop('attachments', None)
    item.pop('collections', None)
    item.pop('__citekey__', None)
    item.pop('uri', None)

    item['notes'] = sorted([html2md(note if type(note) == str else note['note']) for note in item.get('notes', [])])

    if 'note' in item: item['note']  = html2md(item['note'])

    item['tags'] = sorted([(tag if type(tag) == str else tag['tag']) for tag in item.get('tags', [])])

    for k in list(item.keys()):
      v = item[k]
      if v is None: del item[k]
      if type(v) in [list, dict] and len(v) == 0: del item[k]

  collections = lib.get('collections', {})
  while any(coll for coll in collections.values() if not coll.get('path', None)):
    for coll in collections.values():
      if coll.get('path', None): continue

      if not coll.get('parent', None):
        coll['path'] = [ coll['name'] ]
      elif collections[ coll['parent'] ].get('path', None):
        coll['path'] = collections[ coll['parent'] ]['path'] + [ coll['name'] ]

  for key, coll in collections.items():
    coll['key'] = ' ::: '.join(coll['path'])
    coll.pop('path', None)
    coll.pop('id', None)

  for key, coll in collections.items():
    if coll['parent']: coll['parent'] = collections[coll['parent']]['key']
    coll['collections'] = [collections[key]['key'] for key in coll['collections']]
    coll['items'] = [itemIDs[itemID] for itemID in coll['items']]

  lib['collections'] = {coll['key']: coll for coll in collections.values()}

  return strip_obj(lib)

def compare(expected, found):
  size = 30
  if len(expected) < size or len(found) < size:
    assert_equal_diff(serialize(expected), serialize(found))
  else:
    for start in range(0, max(len(expected), len(found)), size):
      assert_equal_diff(serialize(expected[start:start + size]), serialize(found[start:start + size]))

def execute(script, **args):
  for var, value in args.items():
    script = f'const {var} = {json.dumps(value)};\n' + script

  req = urllib.request.Request(f'http://127.0.0.1:{client.port}/debug-bridge/execute', data=script.encode('utf-8'), headers={'Content-type': 'text/plain'})
  res = urllib.request.urlopen(req, timeout=client.timeout).read().decode()
  return json.loads(res)

class Preferences:
  def __init__(self):
    self.pref = {}
    self.prefix = 'translators.better-bibtex.'
    with open(os.path.join(ROOT, 'gen/preferences/defaults.json')) as f:
      self.supported = {self.prefix + k: type(v) for (k, v) in json.load(f).items()}
    self.supported['removeStock'] = bool

  def __setitem__(self, key, value):
    if key[0] == '.': key = self.prefix + key[1:]

    if key.startswith(self.prefix):
      assert key in self.supported, f'Unknown preference "{key}"'
      assert type(value) == self.supported[key], f'Unexpected value of type {type(value)} for preference {key}'

    if key == 'translators.better-bibtex.postscript':
      with open(os.path.join('test/fixtures', value)) as f:
        value = f.read()

    self.pref[key] = value
    execute('Zotero.Prefs.set(pref, value)', pref=key, value=value)

  def keys(self):
    return self.pref.keys()

  def parse(self, value):
    value = value.strip()

    if value in ['true', 'false']: return value == 'true'

    try:
      return int(value)
    except:
      pass

    if len(value) >= 2:
      if value[0] == '"' and value[-1] == '"': return json.loads(value)
      if value[0] == "'" and value[-1] == "'": return value[1:-1]

    return value

def export_library(translator, displayOptions = {}, collection = None, output = None, expected = None):
  assert not displayOptions.get('keepUpdated', False) or output # Auto-export needs a destination

  if translator.startswith('id:'):
    translator = translator[len('id:'):]
  else:
    translator = TRANSLATORS.byName[translator].translatorID

  found = execute('return await Zotero.BetterBibTeX.TestSupport.exportLibrary(translatorID, displayOptions, path, collection)',
    translatorID=translator,
    displayOptions=displayOptions,
    path=output,
    collection=collection
  )

  if expected is None: return

  if output:
    with open(output) as f:
      found = f.read()

  expected, ext = expand_expected(expected)
  with open(expected) as f:
    expected = f.read()

  if ext == '.csl.json':
    return compare(json.loads(expected), json.loads(found))

  elif ext == '.csl.yml':
    with open('exported.csl.yml', 'w') as f: f.write(found)
    assert_equal_diff(
      serialize(yaml.load(io.StringIO(expected))),
      serialize(yaml.load(io.StringIO(found)))
    )
    return

  elif ext == '.json':
    with open('exported.json', 'w') as f: f.write(found)

    found = normalizeJSON(json.loads(found))
    expected = normalizeJSON(json.loads(expected))

    if len(expected['items']) < 30 or len(found['items']) < 30:
      print('SMALL COMPARE')
      assert_equal_diff(serialize(expected), serialize(found))
      return
    else:
      print('BIG COMPARE')
      assert_equal_diff(serialize({ **expected, 'items': []}), serialize({ **found, 'items': []}))
      return compare(expected['items'], found['items'])

  with open('exported.txt', 'w') as f: f.write(found)
  expected = expected.strip()
  found = found.strip()

  assert_equal_diff(expected, found)

def expand_expected(expected):
  base, ext = os.path.splitext(expected)
  if ext in ['.yml', '.json'] and base.endswith('.csl'):
    base = os.path.splitext(base)[0]
    ext = '.csl' + ext
  assert ext != ''

  fixtures = os.path.join(ROOT, 'test/fixtures')

  if client.zotero: return [ os.path.join(fixtures, expected), ext ]

  expected = None
  for variant in ['.juris-m', '']:
    variant = os.path.join(fixtures, f'{base}{variant}{ext}')
    if os.path.exists(variant): return [variant, ext]

  return [None, None]

def import_file(context, references, collection = False):
  assert type(collection) in [bool, str]

  fixtures = os.path.join(os.path.dirname(__file__), '../../test/fixtures')
  references = os.path.join(fixtures, references)

  if references.endswith('.json'):
    with open(references) as f:
      config = json.load(f).get('config', {})
    preferences = config.get('preferences', {})
    context.displayOptions = config.get('options', {})

    if 'testing' in preferences: del preferences['testing']
    preferences = {
      pref: (','.join(value) if type(value) == list else value)
      for pref, value in preferences.items()
      if not context.preferences.prefix + pref in context.preferences.keys()
    }
    for k, v in preferences.items():
      assert context.preferences.prefix + k in context.preferences.supported, f'Unsupported preference "{k}"'
      assert type(v) == context.preferences.supported[context.preferences.prefix + k], f'Value for preference {k} has unexpected type {type(v)}'
  else:
    context.displayOptions = {}
    preferences = None

  with tempfile.TemporaryDirectory() as d:
    if type(collection) is str:
      orig = references
      references = os.path.join(d, collection)
      shutil.copy(orig, references)

    if '.bib' in references:
      copy = False
      bib = ''
      with open(references) as f:
        for line in f.readlines():
          if line.lower().startswith('@comment{jabref-meta: filedirectory:'):
            bib += f"@Comment{{jabref-meta: fileDirectory:{os.path.join(os.path.dirname(references), 'attachments')};}}\n"
            copy = True
          else:
            bib += line
      if copy:
        references += '_'
        with open(references, 'w') as out:
          out.write(bib)

    return execute('return await Zotero.BetterBibTeX.TestSupport.importFile(filename, createNewCollection, preferences)',
      filename = references,
      createNewCollection = (collection != False),
      preferences = preferences
    )
