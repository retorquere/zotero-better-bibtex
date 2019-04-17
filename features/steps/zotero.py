import json
import os
import urllib
import tempfile
from munch import *
import difflib

ROOT = os.path.join(os.path.dirname(__file__), '../..')
with open(os.path.join(ROOT, 'gen/translators.json')) as f:
  TRANSLATORS = json.load(f, object_hook=Munch)

CLIENT=None

def assert_equal_diff(expected, found):
  assert found == expected, '\n' + '\n'.join(difflib.context_diff(expected.split('\n'), found.split('\n'), fromfile='expected', tofile='found', lineterm=''))

def execute(script, **args):
  for var, value in args.items():
    script = f'const {var} = {json.dumps(value)};\n' + script

  req = urllib.request.Request('http://127.0.0.1:23119/debug-bridge/execute', data=script.encode('utf-8'), headers={'Content-type': 'text/plain'})
  res = urllib.request.urlopen(req).read().decode()
  return json.loads(res)

class Preferences:
  def __init__(self):
    self.pref = {}
    self.prefix = 'translators.better-bibtex.'
    with open(os.path.join(ROOT, 'gen/preferences/defaults.json')) as f:
      self.supported = [self.prefix + k for k in json.load(f).keys()]

  def __getitem__(self, key):
    return self.pref[key]

  def __setitem__(self, key, value):
    value = self.parse(value)

    if key[0] == '.': key = self.prefix + key[1:]

    if key.startswith(self.prefix):
      assert key in self.supported, f'Unknown preference "{key}"'

    if key == 'translators.better-bibtex.postscript':
      with open(path.join('test/fixtures', value)) as f:
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
    return compare(json.loads(found), json.loads(expected))

  elif ext == '.csl.yml':
    assert sort_yaml(found) == sort_yaml(expected)
    return

  elif exit == '.json':
    with open('exported.json', 'w') as f: f.write(found)

    found = normalizeJSON(JSON.parse(found))
    expected = normalizeJSON(JSON.parse(expected))

    if len(found['items']) < 30 or len(expected['items']) < 30:
      assert serialize(found) == serialize(expected)
      return
    else:
      assert serialize({ **found, 'items': []}) == serialize({ **expected, 'items': []})
      return compare(found['items'], expected['items'])

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

  assert CLIENT is not None

  if CLIENT == 'zotero': return [ os.path.join(fixtures, expected), ext ]

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

    for pref in context.preferences.keys():
      if pref in preferences:
        del preferences[pref]

    if 'testing' in preferences: del preferences['testing']
  else:
    context.displayOptions = {}
    preferences = None

  with tempfile.TemporaryDirectory() as d:
    if type(collection) is str:
      orig = references
      references = os.path.join(d, collection)
      shutil.cp(orig, references)

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
      preferences = preferences,
      createNewCollection = (collection != False)
    )
