import sqlite3
import uuid
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
from steps.utils import running, nested_dict_iter, benchmark, ROOT, assert_equal_diff, compare, serialize, html2md, post_log
import steps.utils as utils
import shutil
import shlex
import io
import psutil
import subprocess
import atexit
import time
import datetime
import collections
import sys
import threading
import socket

from ruamel.yaml import YAML
yaml = YAML(typ='safe')
yaml.default_flow_style = False

EXPORTED = os.path.join(ROOT, 'exported')

class Pinger():
  def __init__(self, every):
    self.every = every

  def __enter__(self):
    self.stop = threading.Event()
    threading.Timer(self.every, self.display, [time.time(), self.every, self.stop]).start()

  def __exit__(self, *args):
    self.stop.set()

  def display(self, start, every, stop):
    if stop.is_set(): return

    utils.print('.', end='')
    threading.Timer(every, self.display, [start, every, stop]).start()

class Config:
  def __init__(self, userdata):
    self.data = [
      {
        'db': '',
        'locale': userdata.get('locale', ''),
        'first_run': userdata.get('first-run', 'false') == 'true',
        'timeout': 60,
      }
    ]
    self.reset()

  def __getattr__(self, name):
    value = [frame for frame in self.data if name in frame]
    if len(value) == 0: raise AttributeError(f"'{type(self)}' object has no attribute '{name}'")

    value = value[0][name]
    if name == 'db' and value == '': value = None
    return value

  def __setattr__(self, name, value):
    if name == 'data':
      super().__setattr__(name, value)
    else:
      self.update(**{name: value})

  def update(self, **kwargs):
    for k, v in kwargs.items():
      if not k in self.data[-1]: raise AttributeError(f"'{type(self)}' object has no attribute '{name}'")
      if type(v) != type(self.data[-1][k]): raise ValueError(f'{type(self)}.{k} must be of type {self.data[-1][k]}')
      self.data[0][k] = v

  def stash(self):
    self.data.insert(0, {})

  def pop(self):
    if len(self.data) <= 1: raise ValueError('cannot pop last frame')
    self.data.pop(0)

  def reset(self):
    self.data = self.data[-1:]
    self.stash()

  def __str__(self):
    return str(self.data)

class Zotero:
  def __init__(self, userdata):
    assert not running('Zotero'), 'Zotero is running'

    self.client = userdata.get('client', 'zotero')
    self.beta = userdata.get('beta') == 'true'
    self.password = str(uuid.uuid4())

    self.config = Config(userdata)

    self.proc = None

    if os.path.exists(EXPORTED):
      shutil.rmtree(EXPORTED)
    os.makedirs(EXPORTED)

    if self.client == 'zotero':
      self.port = 23119
    elif self.client == 'jurism':
      self.port = 24119
    else:
      raise ValueError(f'Unexpected client "{self.client}"')

    self.zotero = self.client == 'zotero'
    self.jurism = self.client == 'jurism'

    with open(os.path.join(ROOT, 'gen/translators.json')) as f:
      self.translators = json.load(f, object_hook=Munch)

    if userdata.get('kill', 'true') == 'true':
      atexit.register(self.shutdown)

    self.testing = userdata.get('testing', 'true') == 'true'

    self.preferences = Preferences(self)
    self.redir = '>'
    self.start()
    self.redir = '>>'

  def execute(self, script, **args):
    for var, value in args.items():
      script = f'const {var} = {json.dumps(value)};\n' + script

    with Pinger(20):
      req = urllib.request.Request(f'http://127.0.0.1:{self.port}/debug-bridge/execute?password={self.password}', data=script.encode('utf-8'), headers={'Content-type': 'application/javascript'})
      res = urllib.request.urlopen(req, timeout=self.config.timeout).read().decode()
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
        utils.print("process {} terminated with exit code {}".format(proc, proc.returncode))

    zotero = psutil.Process(self.proc.pid)
    alive = zotero.children(recursive=True)
    alive.append(zotero)

    for p in alive:
      try:
        p.terminate()
      except psutil.NoSuchProcess:
        pass
    gone, alive = psutil.wait_procs(alive, timeout=5, callback=on_terminate)

    if alive:
      for p in alive:
        utils.print("process {} survived SIGTERM; trying SIGKILL" % p)
        try:
          p.kill()
        except psutil.NoSuchProcess:
          pass
      gone, alive = psutil.wait_procs(alive, timeout=5, callback=on_terminate)
      if alive:
        for p in alive:
          utils.print("process {} survived SIGKILL; giving up" % p)
    self.proc = None
    assert not running('Zotero')

  def restart(self, **kwargs):
    self.shutdown()
    self.config.update(**kwargs)
    self.start()

  def start(self):
    self.needs_restart = False
    profile = self.create_profile()

    cmd = f'{shlex.quote(profile.binary)} -P {shlex.quote(profile.name)} -jsconsole -ZoteroDebugText -datadir profile {self.redir} {shlex.quote(profile.path + ".log")} 2>&1'
    utils.print(f'Starting {self.client}: {cmd}')
    self.proc = subprocess.Popen(cmd, shell=True)
    utils.print(f'{self.client} started: {self.proc.pid}')

    ready = False
    self.config.stash()
    self.config.timeout = 2
    with benchmark(f'starting {self.client}') as bm:
      posted = False
      for _ in redo.retrier(attempts=120,sleeptime=1):
        utils.print('connecting... (%.2fs)' % (bm.elapsed,))

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
            if (testing && !Zotero.Prefs.get('translators.better-bibtex.testing')) throw new Error('translators.better-bibtex.testing not set!')
            Zotero.debug('{better-bibtex:debug bridge}: startup: BetterBibTeX ready!');
            return true;
          """, testing = self.testing)
          if ready: break

        except (urllib.error.HTTPError, urllib.error.URLError,socket.timeout):
          pass

        if bm.elapsed > 2000 and not posted: posted = post_log()

    assert ready, f'{self.client} did not start'
    self.config.pop()

  def reset(self):
    if self.needs_restart:
      self.shutdown()
      self.config.reset()
      self.start()

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

    if self.client == 'zotero': return [ os.path.join(fixtures, expected), ext ]

    expected = None
    for variant in ['.juris-m', '']:
      variant = os.path.join(fixtures, f'{base}{variant}{ext}')
      if os.path.exists(variant): return [variant, ext]

    return [None, None]

  def create_profile(self):
    profile = Munch(
      name='BBTZ5TEST'
    )

    profile.path = os.path.expanduser(f'~/.{profile.name}')

    profile.profiles = {
      # 'Linux': os.path.expanduser(f'~/.{self.client}/{self.client}'),
      'Linux': os.path.expanduser(f'~/.{self.client}/zotero'),
      'Darwin': os.path.expanduser('~/Library/Application Support/' + {'zotero': 'Zotero', 'jurism': 'Juris-M'}[self.client]),
    }[platform.system()]
    os.makedirs(profile.profiles, exist_ok = True)

    beta = ''
    if self.beta: beta = '-beta'
    profile.binary = {
      'Linux': f'/usr/lib/{self.client}{beta}/{self.client}',
      'Darwin': f'/Applications/{self.client.title()}{beta}.app/Contents/MacOS/{self.client}',
    }[platform.system()]

    # create profile
    profile.ini = os.path.join(profile.profiles, 'profiles.ini')

    ini = configparser.RawConfigParser()
    ini.optionxform = str
    if os.path.exists(profile.ini): ini.read(profile.ini)

    if not ini.has_section('General'): ini.add_section('General')

    profile.id = None
    for p in ini.sections():
      for k, v in ini.items(p):
        if k == 'Name' and v == profile.name: profile.id = p

    if not profile.id:
      free = 0
      while True:
        profile.id = f'Profile{free}'
        if not ini.has_section(profile.id): break
        free += 1
      ini.add_section(profile.id)
      ini.set(profile.id, 'Name', profile.name)

    ini.set(profile.id, 'IsRelative', 0)
    ini.set(profile.id, 'Path', profile.path)
    ini.set(profile.id, 'Default', None)
    with open(profile.ini, 'w') as f:
      ini.write(f, space_around_delimiters=False)

    # layout profile
    fixtures = os.path.join(ROOT, 'test/fixtures')
    profile.firefox = webdriver.FirefoxProfile(os.path.join(fixtures, 'profile', self.client))

    for xpi in glob.glob(os.path.join(ROOT, 'xpi/*.xpi')):
      profile.firefox.add_extension(xpi)

    profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.testing', self.testing)
    profile.firefox.set_preference('extensions.zotero.debug-bridge.password', self.password)
    profile.firefox.set_preference('dom.max_chrome_script_run_time', self.config.timeout)
    utils.print(f'dom.max_chrome_script_run_time={self.config.timeout}')

    with open(os.path.join(os.path.dirname(__file__), 'preferences.toml')) as f:
      preferences = toml.load(f)
      for p, v in nested_dict_iter(preferences['general']):
        profile.firefox.set_preference(p, v)

      if self.config.locale == 'fr':
        for p, v in nested_dict_iter(preferences['fr']):
          profile.firefox.firefox.set_preference(p, v)

    if not self.config.first_run:
      profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.citekeyFormat', '[auth][shorttitle][year]')

    if self.client == 'jurism':
      utils.print('\n\n** WORKAROUNDS FOR JURIS-M IN PLACE -- SEE https://github.com/Juris-M/zotero/issues/34 **\n\n')
      profile.firefox.set_preference('extensions.zotero.dataDir', os.path.join(profile.path, 'jurism'))
      profile.firefox.set_preference('extensions.zotero.useDataDir', True)
      profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.removeStock', False)

    profile.firefox.update_preferences()

    shutil.rmtree(profile.path, ignore_errors=True)
    shutil.move(profile.firefox.path, profile.path)
    profile.firefox = None

    if self.config.db:
      self.needs_restart = True
      utils.print(f'restarting using {self.config.db}')
      dbs = os.path.join(ROOT, 'test', 'db', self.config.db)
      if not os.path.exists(dbs): os.makedirs(dbs)

      db_zotero = os.path.join(dbs, f'{self.client}.sqlite')
      if not os.path.exists(db_zotero):
        urllib.request.urlretrieve(f'https://github.com/retorquere/zotero-better-bibtex/releases/download/test-database/{self.config.db}.zotero.sqlite', db_zotero)
      shutil.copy(db_zotero, os.path.join(profile.path, self.client, os.path.basename(db_zotero)))

      db_bbt = os.path.join(dbs, 'better-bibtex.sqlite')
      if not os.path.exists(db_bbt):
        urllib.request.urlretrieve(f'https://github.com/retorquere/zotero-better-bibtex/releases/download/test-database/{self.config.db}.better-bibtex.sqlite', db_bbt)
      shutil.copy(db_bbt, os.path.join(profile.path, self.client, os.path.basename(db_bbt)))
      db = sqlite3.connect(os.path.join(profile.path, self.client, os.path.basename(db_bbt)))
      ae = None
      for (ae,) in db.execute('SELECT data FROM "better-bibtex" WHERE name = ?', [ 'better-bibtex.autoexport' ]):
        ae = json.loads(ae)
        ae['data'] = []
      if ae:
        db.execute('UPDATE "better-bibtex" SET data = ? WHERE name = ?', [ json.dumps(ae), 'better-bibtex.autoexport' ])
        db.commit()
      db.close()

    return profile

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
