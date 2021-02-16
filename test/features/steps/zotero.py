import sqlite3
import uuid
import json, jsonpatch
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
from steps.utils import running, nested_dict_iter, benchmark, ROOT, assert_equal_diff, serialize, html2md, post_log
from steps.library import load as Library
from steps.bbtjsonschema import validate as validate_bbt_json
import steps.utils as utils
import shutil
import shlex
import io
import psutil
import subprocess
import atexit
import time
import datetime
from collections import OrderedDict, MutableMapping
import sys
import threading
import socket
from pathlib import PurePath
from diff_match_patch import diff_match_patch

from ruamel.yaml import YAML
yaml = YAML(typ='safe')
yaml.default_flow_style = False

EXPORTED = os.path.join(ROOT, 'exported')
FIXTURES = os.path.join(ROOT, 'test/fixtures')

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
        'profile': '',
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

    self.fixtures_loaded = set()
    self.fixtures_loaded_log = userdata.get('loaded')

    self.client = userdata.get('client', 'zotero')
    self.beta = userdata.get('beta') == 'true'
    self.password = str(uuid.uuid4())
    self.import_at_start = os.environ.get('ZOTERO_IMPORT', None)

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
    if userdata.get('workers', 'true') == 'true':
      self.workers = 1
    else:
      self.workers = 0

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
    shutil.rmtree(os.path.join(profile.path, self.client, 'better-bibtex'), ignore_errors=True)

    if self.client == 'zotero':
      datadir_profile = '-datadir profile'
    else:
      utils.print('\n\n** WORKAROUNDS FOR JURIS-M IN PLACE -- SEE https://github.com/Juris-M/zotero/issues/34 **\n\n')
      datadir_profile = ''
    cmd = f'{shlex.quote(profile.binary)} -P {shlex.quote(profile.name)} -jsconsole -ZoteroDebugText {datadir_profile} {self.redir} {shlex.quote(profile.path + ".log")} 2>&1'
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

    if self.import_at_start:
      self.execute(f'return await Zotero.BetterBibTeX.TestSupport.importFile({json.dumps(self.import_at_start)})')
      self.import_at_start = None

  def reset(self):
    if self.needs_restart:
      self.shutdown()
      self.config.reset()
      self.start()

    self.execute('await Zotero.BetterBibTeX.TestSupport.reset()')
    self.preferences = Preferences(self)

  def reset_cache(self):
    self.execute('Zotero.BetterBibTeX.TestSupport.resetCache()')

  def loaded(self, path):
    self.fixtures_loaded.add(str(PurePath(path).relative_to(FIXTURES)))
    if self.fixtures_loaded_log:
      with open(self.fixtures_loaded_log, 'w') as f:
        json.dump(sorted(list(self.fixtures_loaded)), f, indent='  ')

  def load(self, path, attempt_patch=False):
    path = os.path.join(FIXTURES, path)

    with open(path) as f:
      if path.endswith('.json'):
        data = json.load(f, object_pairs_hook=OrderedDict)
      elif path.endswith('.yml'):
        data = yaml.load(f)
      else:
        data = f.read()

    patch = path + '.' + self.client + '.patch'

    if not attempt_patch or not os.path.exists(patch):
      loaded = path
    else:
      for ext in ['.schomd.json', '.csl.json', os.path.splitext(path)[1]]:
        if path.endswith(ext):
          loaded = path[:-len(ext)] + '.' + self.client + ext
          break

      if path.endswith('.json') or path.endswith('.yml'):
        with open(patch) as f:
          data = jsonpatch.JsonPatch(json.load(f)).apply(data)
      else:
        with open(patch) as f:
          dmp = diff_match_patch()
          data = dmp.patch_apply(dmp.patch_fromText(f.read()), data)[0]

    if path.endswith('.json') and not (path.endswith('.csl.json') or path.endswith('.schomd.json')):
      validate_bbt_json(data)

    self.loaded(loaded)
    return (data, loaded)

  def exported(self, path, data=None):
    path = os.path.join(EXPORTED, os.path.basename(os.path.dirname(path)), os.path.basename(path))

    if data is None:
      os.remove(path)
      exdir = os.path.dirname(path)
      if len(os.listdir(exdir)) == 0:
        os.rmdir(exdir)
    else:
      os.makedirs(os.path.dirname(path), exist_ok = True)

      with open(path, 'w') as f:
        f.write(data)

    return path

  def export_library(self, translator, displayOptions = {}, collection = None, output = None, expected = None, resetCache = False):
    assert not displayOptions.get('keepUpdated', False) or output # Auto-export needs a destination
    displayOptions['Normalize'] = True

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

    expected_file = expected
    expected, loaded_file = self.load(expected_file, True)
    exported = self.exported(loaded_file, found)

    if expected_file.endswith('.csl.json'):
      assert_equal_diff(json.dumps(expected, sort_keys=True, indent='  '), json.dumps(json.loads(found), sort_keys=True, indent='  '))

    elif expected_file.endswith('.csl.yml'):
      assert_equal_diff(serialize(expected), serialize(yaml.load(io.StringIO(found))))

    elif expected_file.endswith('.json'):
      # TODO: clean lib and test against schema

      expected = Library(expected)
      found = Library(json.loads(found, object_pairs_hook=OrderedDict))
      assert_equal_diff(serialize(expected), serialize(found))

    else:
      assert_equal_diff(expected.strip(), found.strip())

    self.exported(exported)

  def import_file(self, context, references, collection = False, items=True):
    assert type(collection) in [bool, str]

    data, references = self.load(references)

    if references.endswith('.json'):
      # TODO: clean lib and test against schema
      config = data.get('config', {})
      preferences = config.get('preferences', {})
      localeDateOrder = config.get('localeDateOrder', None)
      context.displayOptions = config.get('options', {})

      # TODO: this can go because the schema check will assure it won't get passed in
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
      localeDateOrder = None

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
      return self.execute('return await Zotero.BetterBibTeX.TestSupport.importFile(filename, createNewCollection, preferences, localeDateOrder)',
        filename = filename,
        createNewCollection = (collection != False),
        preferences = preferences,
        localeDateOrder = localeDateOrder
      )

  def expand_expected(self, expected):
    base, ext = os.path.splitext(expected)
    if ext in ['.yml', '.json'] and base.endswith('.csl'):
      base = os.path.splitext(base)[0]
      ext = '.csl' + ext
    assert ext != ''

    if self.client == 'zotero': return [ os.path.join(FIXTURES, expected), ext ]

    expected = None
    for variant in ['.juris-m', '']:
      variant = os.path.join(FIXTURES, f'{base}{variant}{ext}')
      if os.path.exists(variant): return [variant, ext]

    return [None, None]

  def install_xpis(self, path, profile):
    if not os.path.exists(path): return
    utils.print(f'Installing xpis in {path}')

    for xpi in glob.glob(os.path.join(path, '*.xpi')):
      utils.print(f'installing {xpi}')
      profile.add_extension(xpi)

  def create_profile(self):
    profile = Munch(
      name='BBTZ5TEST'
    )

    profile.path = os.path.expanduser(f'~/.{profile.name}')

    profile.profiles = {
      # 'Linux': os.path.expanduser(f'~/.{self.client}/{self.client}'),
      'Linux': os.path.expanduser(f'~/.{self.client}/zotero'),
      # 'Darwin': os.path.expanduser('~/Library/Application Support/' + {'zotero': 'Zotero', 'jurism': 'Juris-M'}[self.client]),
      'Darwin': os.path.expanduser('~/Library/Application Support/Zotero'),
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
    if self.config.profile:
      profile.firefox = webdriver.FirefoxProfile(os.path.join(ROOT, 'test/db', self.config.profile))
      profile.firefox.set_preference('extensions.zotero.dataDir', os.path.join(profile.path, self.client))
      profile.firefox.set_preference('extensions.zotero.useDataDir', True)
      profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.removeStock', False)
    else:
      profile.firefox = webdriver.FirefoxProfile(os.path.join(FIXTURES, 'profile', self.client))

    self.install_xpis(os.path.join(ROOT, 'xpi'), profile.firefox)
    self.install_xpis(os.path.join(ROOT, 'other-xpis'), profile.firefox)
    if self.config.db: self.install_xpis(os.path.join(ROOT, 'test/db', self.config.db, 'xpis'), profile.firefox)
    if self.config.profile: self.install_xpis(os.path.join(ROOT, 'test/db', self.config.profile, 'xpis'), profile.firefox)

    profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.testing', self.testing)
    profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.workers', self.workers)
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
      # force stripping of the pattern
      profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.citekeyFormat', "[auth:lower][year] | [=forumPost/WebPage][Auth:lower:capitalize][Date:format-date=%Y-%m-%d.%H\\:%M\\:%S:prefix=.][PublicationTitle1_1:lower:capitalize:prefix=.][shorttitle3_3:lower:capitalize:prefix=.][Pages:prefix=.p.][Volume:prefix=.Vol.][NumberofVolumes:prefix=de] | [Auth:lower:capitalize][date:%oY:prefix=.][PublicationTitle1_1:lower:capitalize:prefix=.][shorttitle3_3:lower:capitalize:prefix=.][Pages:prefix=.p.][Volume:prefix=.Vol.][NumberofVolumes:prefix=de]")

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
      db_zotero_alt = os.path.join(dbs, self.client, f'{self.client}.sqlite')
      if not os.path.exists(db_zotero) and not os.path.exists(db_zotero_alt):
        urllib.request.urlretrieve(f'https://github.com/retorquere/zotero-better-bibtex/releases/download/test-database/{self.config.db}.zotero.sqlite', db_zotero)
      if not os.path.exists(db_zotero): db_zotero = db_zotero_alt
      shutil.copy(db_zotero, os.path.join(profile.path, self.client, os.path.basename(db_zotero)))

      db_bbt = os.path.join(dbs, 'better-bibtex.sqlite')
      db_bbt_alt = os.path.join(dbs, self.client, 'better-bibtex.sqlite')
      if not os.path.exists(db_bbt) and not os.path.exists(db_bbt_alt):
        urllib.request.urlretrieve(f'https://github.com/retorquere/zotero-better-bibtex/releases/download/test-database/{self.config.db}.better-bibtex.sqlite', db_bbt)
      if not os.path.exists(db_bbt): db_bbt = db_bbt_alt
      shutil.copy(db_bbt, os.path.join(profile.path, self.client, os.path.basename(db_bbt)))

      # remove any auto-exports that may exist
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

def strip_obj(data):
  if type(data) == list:
    stripped = [strip_obj(e) for e in data]
    return [e for e in stripped if e not in ['', u'', {}, None, []]]

  if type(data) == dict:
    stripped = {k: strip_obj(v) for (k, v) in data.items()}
    return {k: v for (k, v) in stripped.items() if v not in ['', u'', {}, None, []]}

  return data

class Preferences:
  def __init__(self, zotero):
    self.zotero = zotero
    self.pref = {}
    self.prefix = 'translators.better-bibtex.'
    with open(os.path.join(ROOT, 'gen/preferences.json')) as f:
      self.supported = {self.prefix + pref['var']: type(pref['default']) for pref in json.load(f)}
    self.supported[self.prefix + 'removeStock'] = bool
    self.supported[self.prefix + 'ignorePostscriptErrors'] = bool

  def __setitem__(self, key, value):
    if key[0] == '.': key = self.prefix + key[1:]

    if key.startswith(self.prefix):
      assert key in self.supported, f'Unknown preference "{key}"'
      assert type(value) == self.supported[key], f'Unexpected value of type {type(value)} for preference {key}'

    if key == 'translators.better-bibtex.postscript':
      with open(os.path.join(FIXTURES, value)) as f:
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

class Pick(MutableMapping):
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
