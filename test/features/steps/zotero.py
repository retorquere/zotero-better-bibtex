import threading
import json
import os
import redo
import platform
import configparser
import glob
from selenium import webdriver
import toml
import urllib
import tempfile
from munch import *
from steps.utils import running, nested_dict_iter, benchmark, ROOT, assert_equal_diff, compare, serialize, html2md
import shutil
import shlex
import io
import psutil
import subprocess
import atexit
import time
import collections
import sys

from ruamel.yaml import YAML
yaml = YAML(typ='safe')
yaml.default_flow_style = False

EXPORTED = os.path.join(ROOT, 'exported')

class Pinger(threading.Thread):
  wait = 300

  def __init__(self, max_run_time):
    threading.Thread.__init__(self)
    self.running = True
    self.max_run_time = max_run_time
    self.start_time = time.time()

  def run(self):
    while True:
      for _ in range(self.wait):
        if not self.running or (time.time() - self.start_time) > self.max_run_time: return
        time.sleep(1)
      sys.stderr.write('.')
      sys.stderr.flush()

  def stop(self):
    self.running = False

class Zotero:
  def __init__(self, userdata, db=None):
    assert not running('Zotero'), 'Zotero is running'
    self.timeout = 60

    if os.path.exists(EXPORTED):
      shutil.rmtree(EXPORTED)
    os.makedirs(EXPORTED)

    self.userdata = userdata

    self.password = userdata['debugbridgepassword']

    self.id = self.userdata.get('zotero', 'zotero')
    if self.id == 'zotero':
      self.port = 23119
    elif self.id == 'jurism':
      self.port = 24119
    else:
      raise ValueError(f'Unexpected client "{self.userdata.zotero}"')

    self.zotero = self.id == 'zotero'
    self.jurism = self.id == 'jurism'

    with open(os.path.join(ROOT, 'gen/translators.json')) as f:
      self.translators = json.load(f, object_hook=Munch)

    if self.userdata.get('kill', 'true') == 'true':
      atexit.register(self.shutdown)

    self.preferences = Preferences(self)
    self.start(db)

  def execute(self, script, **args):
    for var, value in args.items():
      script = f'const {var} = {json.dumps(value)};\n' + script

#    # keep Travis satisfied
#    if self.timeout > Pinger.wait:
#      pinger = Pinger(self.timeout)
#      pinger.start()
#    else:
#      pinger = None

    req = urllib.request.Request(f'http://127.0.0.1:{self.port}/debug-bridge/execute?password={self.password}', data=script.encode('utf-8'), headers={'Content-type': 'application/javascript'})
    res = urllib.request.urlopen(req, timeout=self.timeout).read().decode()

#    if pinger:
#      pinger.stop()
#      pinger.join()

    return json.loads(res)

  def shutdown(self):
    if self.proc is None: return

    # graceful shutdown
    try:
      self.execute("""
        const appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].getService(Components.interfaces.nsIAppStartup);
        appStartup.quit(Components.interfaces.nsIAppStartup.eAttemptQuit);
      """)
    except:
      pass

    def on_terminate(proc):
        print("process {} terminated with exit code {}".format(proc, proc.returncode))

    zotero = psutil.Process(self.proc.pid)
    procs = zotero.children().append(zotero)

    for p in procs:
      try:
        p.terminate()
      except psutil.NoSuchProcess:
        pass
    gone, alive = psutil.wait_procs(procs, timeout=5, callback=on_terminate)

    if alive:
      for p in alive:
        print("process {} survived SIGTERM; trying SIGKILL" % p)
        try:
          p.kill()
        except psutil.NoSuchProcess:
          pass
      gone, alive = psutil.wait_procs(alive, timeout=5, callback=on_terminate)
      if alive:
        for p in alive:
        print("process {} survived SIGKILL; giving up" % p)
    self.proc = None
    assert not running('Zotero')

  def start(self, db=None):
    profile = Profile('BBTZ5TEST', self.id, self.userdata, db)
    redir = '>'
    if db: redir = '>>'
    cmd = f'{shlex.quote(profile.binary)} -P {shlex.quote(profile.name)} -jsconsole -ZoteroDebugText -datadir profile {redir} {shlex.quote(profile.path + ".log")} 2>&1'
    print(f'Starting {self.id}: {cmd}')
    self.proc = subprocess.Popen(cmd, shell=True)
    print(f'{self.id} started: {self.proc.pid}')

    ready = False
    with benchmark(f'starting {self.id}'):
      for _ in redo.retrier(attempts=30,sleeptime=1):
        print('connecting...')
        try:
          ready = self.execute("""
            if (!Zotero.BetterBibTeX) {
              Zotero.debug('{better-bibtex:debug bridge}: startup: BetterBibTeX not loaded')
              return false;
            }
            if (!Zotero.BetterBibTeX.ready) {
              if (typeof Zotero.BetterBibTeX.ready === 'boolean') {
                Zotero.debug('{better-bibtex:debug bridge}: startup: BetterBibTeX initialization error')
              } else {
                Zotero.debug('{better-bibtex:debug bridge}: startup: BetterBibTeX not initialized')
              }
              return false;
            }

            Zotero.debug('{better-bibtex:debug bridge}: startup: waiting for BetterBibTeX ready...')
            await Zotero.BetterBibTeX.ready;
            if (!Zotero.Prefs.get('translators.better-bibtex.testing')) throw new Error('translators.better-bibtex.testing not set!')
            Zotero.debug('{better-bibtex:debug bridge}: startup: BetterBibTeX ready!');
            return true;
          """)
          if ready: break
        except (urllib.error.HTTPError, urllib.error.URLError):
          pass
    assert ready, f'{self.id} did not start'

  def reset(self):
    self.execute('await Zotero.BetterBibTeX.TestSupport.reset()')
    self.preferences = Preferences(self)

  def export_library(self, translator, displayOptions = {}, collection = None, output = None, expected = None, resetCache = False):
    assert not displayOptions.get('keepUpdated', False) or output # Auto-export needs a destination

    if translator.startswith('id:'):
      translator = translator[len('id:'):]
    else:
      translator = self.translators.byName[translator].translatorID

    found = self.execute('return await Zotero.BetterBibTeX.TestSupport.exportLibrary(translatorID, displayOptions, path, collection)',
      translatorID=translator,
      displayOptions=displayOptions,
      path=output,
      collection=collection
    )
    if resetCache: self.execute('Zotero.BetterBibTeX.TestSupport.resetCache()')

    if expected is None: return

    if output:
      with open(output) as f:
        found = f.read()

    expected, ext = self.expand_expected(expected)
    exported = os.path.join(EXPORTED, os.path.basename(os.path.dirname(expected)) + '-' + os.path.basename(expected))

    with open(expected) as f:
      expected = f.read()

    if ext == '.csl.json':
      with open(exported, 'w') as f: f.write(found)
      compare(json.loads(expected), json.loads(found))
      os.remove(exported)
      return

    elif ext == '.csl.yml':
      with open(exported, 'w') as f: f.write(found)
      assert_equal_diff(
        serialize(yaml.load(io.StringIO(expected))),
        serialize(yaml.load(io.StringIO(found)))
      )
      os.remove(exported)
      return

    elif ext == '.json':
      with open(exported, 'w') as f: f.write(found)

      found = normalizeJSON(json.loads(found))
      expected = normalizeJSON(json.loads(expected))

      if True or len(expected['items']) < 30 or len(found['items']) < 30:
        assert_equal_diff(serialize(expected), serialize(found))
      else:
        assert_equal_diff(serialize({ **expected, 'items': []}), serialize({ **found, 'items': []}))
        compare(expected['items'], found['items'])

      os.remove(exported)
      return

    with open(exported, 'w') as f: f.write(found)
    expected = expected.strip()
    found = found.strip()

    assert_equal_diff(expected, found)
    os.remove(exported)
    return

  def import_file(self, context, references, collection = False, items=True):
    assert type(collection) in [bool, str]

    fixtures = os.path.join(ROOT, 'test/fixtures')
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
        if not self.preferences.prefix + pref in self.preferences.keys()
      }
      for k, v in preferences.items():
        assert self.preferences.prefix + k in self.preferences.supported, f'Unsupported preference "{k}"'
        assert type(v) == self.preferences.supported[self.preferences.prefix + k], f'Value for preference {k} has unexpected type {type(v)}'
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

      filename = references
      if not items: filename = None
      return self.execute('return await Zotero.BetterBibTeX.TestSupport.importFile(filename, createNewCollection, preferences)',
        filename = filename,
        createNewCollection = (collection != False),
        preferences = preferences
      )

  def expand_expected(self, expected):
    base, ext = os.path.splitext(expected)
    if ext in ['.yml', '.json'] and base.endswith('.csl'):
      base = os.path.splitext(base)[0]
      ext = '.csl' + ext
    assert ext != ''

    fixtures = os.path.join(ROOT, 'test/fixtures')

    if self.id == 'zotero': return [ os.path.join(fixtures, expected), ext ]

    expected = None
    for variant in ['.juris-m', '']:
      variant = os.path.join(fixtures, f'{base}{variant}{ext}')
      if os.path.exists(variant): return [variant, ext]

    return [None, None]

class Profile:
  def __init__(self, name, client, userdata, db=None):
    self.name = name

    platform_client = platform.system() + ':' + client

    if platform_client == 'Linux:zotero':
      self.profiles = os.path.expanduser('~/.zotero/zotero')
      self.binary = '/usr/lib/zotero/zotero'
    elif platform_client == 'Linux:jurism':
      self.profiles = os.path.expanduser('~/.jurism/zotero')
      self.binary = '/usr/lib/jurism/jurism'
    elif platform_client == 'Darwin:zotero':
      self.profiles = os.path.expanduser('~/Library/Application Support/Zotero')
      self.binary = '/Applications/Zotero.app/Contents/MacOS/zotero'
    elif platform_client == 'Darwin:jurism':
      self.profiles = os.path.expanduser('~/Library/Application Support/Juris-M')
      self.binary = '/Applications/Jurism.app/Contents/MacOS/jurism'
    else:
      raise ValueError(f'Unsupported test environment {platform_client}')

    os.makedirs(self.profiles, exist_ok = True)
    self.path = os.path.expanduser(f'~/.{self.name}')

    self.create()
    self.layout(client, userdata, db)

  def create(self):
    profiles_ini = os.path.join(self.profiles, 'profiles.ini')

    profiles = configparser.RawConfigParser()
    profiles.optionxform = str
    if os.path.exists(profiles_ini): profiles.read(profiles_ini)

    if not profiles.has_section('General'): profiles.add_section('General')

    id = None
    for p in profiles.sections():
      for k, v in profiles.items(p):
        if k == 'Name' and v == self.name: id = p

    if not id:
      free = 0
      while True:
        id = f'Profile{free}'
        if not profiles.has_section(id): break
        free += 1
      profiles.add_section(id)
      profiles.set(id, 'Name', self.name)

    profiles.set(id, 'IsRelative', 0)
    profiles.set(id, 'Path', self.path)
    profiles.set(id, 'Default', None)
    with open(profiles_ini, 'w') as f:
      profiles.write(f, space_around_delimiters=False)

  def layout(self, client, userdata, db):
    fixtures = os.path.join(ROOT, 'test/fixtures')
    profile = webdriver.FirefoxProfile(os.path.join(fixtures, 'profile', client))

    for xpi in glob.glob(os.path.join(ROOT, 'xpi/*.xpi')):
      profile.add_extension(xpi)

    profile.set_preference('extensions.zotero.translators.better-bibtex.testing', True)
    profile.set_preference('extensions.zotero.debug-bridge.password', userdata['debugbridgepassword'])

    with open(os.path.join(os.path.dirname(__file__), 'preferences.toml')) as f:
      preferences = toml.load(f)
      for p, v in nested_dict_iter(preferences['general']):
        profile.set_preference(p, v)

      if userdata.get('locale', '') == 'fr':
        for p, v in nested_dict_iter(preferences['fr']):
          profile.firefox.set_preference(p, v)

    if userdata.get('first-run', 'false') == 'false':
      profile.set_preference('extensions.zotero.translators.better-bibtex.citekeyFormat', '[auth][shorttitle][year]')

    if client == 'jurism':
      print('\n\n** WORKAROUNDS FOR JURIS-M IN PLACE -- SEE https://github.com/Juris-M/zotero/issues/34 **\n\n')
      #profile.set_preference('extensions.zotero.dataDir', os.path.join(self.path, 'jurism'))
      #profile.set_preference('extensions.zotero.useDataDir', True)
      #profile.set_preference('extensions.zotero.translators.better-bibtex.removeStock', False)

    profile.update_preferences()

    shutil.rmtree(self.path, ignore_errors=True)
    shutil.move(profile.path, self.path)

    if db:
      shutil.copy(db.zotero, os.path.join(self.path, client, os.path.basename(db.zotero)))
      shutil.copy(db.bbt, os.path.join(self.path, client, os.path.basename(db.bbt)))

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

    item.pop('version', None)
    item.pop('libraryID', None)
    item.pop('dateAdded', None)
    item.pop('dateModified', None)
    item.pop('uniqueFields', None)
    item.pop('key', None)
    item.pop('citekey', None)
    item.pop('attachments', None)
    item.pop('collections', None)
    item.pop('__citekey__', None)
    item.pop('citationKey', None)
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

class Preferences:
  def __init__(self, zotero):
    self.zotero = zotero
    self.pref = {}
    self.prefix = 'translators.better-bibtex.'
    with open(os.path.join(ROOT, 'gen/preferences/defaults.json')) as f:
      self.supported = {self.prefix + k: type(v) for (k, v) in json.load(f).items()}
    self.supported[self.prefix + 'removeStock'] = bool
    self.supported[self.prefix + 'postscriptProductionMode'] = bool

  def __setitem__(self, key, value):
    if key[0] == '.': key = self.prefix + key[1:]

    if key.startswith(self.prefix):
      assert key in self.supported, f'Unknown preference "{key}"'
      assert type(value) == self.supported[key], f'Unexpected value of type {type(value)} for preference {key}'

    if key == 'translators.better-bibtex.postscript':
      with open(os.path.join('test/fixtures', value)) as f:
        value = f.read()

    self.pref[key] = value
    self.zotero.execute('Zotero.Prefs.set(pref, value)', pref=key, value=value)

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

class Pick(collections.MutableMapping):
  labels = [
    'article',
    'chapter',
    'subchapter',
    'column',
    'figure',
    'line',
    'note',
    'issue',
    'opus',
    'page',
    'paragraph',
    'subparagraph',
    'part',
    'rule',
    'section',
    'subsection',
    'Section',
    'sub verbo',
    'schedule',
    'title',
    'verse',
    'volume',
  ]

  def __init__(self, *args, **kwargs):
    self._pick = dict()
    self.update(dict(*args, **kwargs))

  def __getitem__(self, key):
    label = self.__label__(key)
    if label: return self._pick['locator']
    return self._pick[key]

  def __setitem__(self, key, value):
    label = self.__label__(key)
    if label:
      self._pick['label'] = label
      self._pick['locator'] = value
    else:
      self._pick[key] = value

  def __delitem__(self, key):
    label = self.__label__(key)
    if label:
      del self._pick['label']
      del self._pick['locator']
    else:
      del self.store[key]

  def __iter__(self):
    return iter(self._pick)

  def __len__(self):
    return len(self._pick)

  def __label__(self, key):
    _key = key.replace(' ', '').lower()
    for label in self.labels:
      if _key == label.replace(' ', '').lower():
        return label
    return None
