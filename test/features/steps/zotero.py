import copy
import bs4
import sqlite3
import uuid
import json, jsonpatch
import os, sys
import redo
import platform
import configparser
import glob
from selenium import webdriver
import toml
import urllib
import requests
import tempfile
from munch import *
from steps.utils import running, nested_dict_iter, benchmark, ROOT, assert_equal_diff, serialize, html2md, clean_html
from steps.library import load as cleanlib, sortbib
import steps.utils as utils
import shutil
import shlex
import io
import psutil
import subprocess
import atexit
import time
import datetime
import jsonschema
import traceback

from collections import OrderedDict
from collections.abc import MutableMapping

import sys
import threading
import socket
from pathlib import PurePath, Path
from diff_match_patch import diff_match_patch
from pygit2 import Repository
from lxml import etree
import zipfile

from ruamel.yaml import YAML
yaml = YAML(typ='safe')
yaml.default_flow_style = False

EXPORTED = os.path.join(ROOT, 'exported')
FIXTURES = os.path.join(ROOT, 'test/fixtures')

#with open(os.path.join(ROOT, 'schema', 'BetterBibTeX JSON.json')) as f:
#  bbt_json_schema = json.load(f)
#def validate_bbt_json(lib):
#  jsonschema.validate(instance=lib, schema=bbt_json_schema)

from selenium.webdriver.firefox.firefox_profile import AddonFormatError
class FirefoxProfile(webdriver.FirefoxProfile):
  def _addon_details(self, addon_path):
    def parse_manifest_json(data):
      manifest = json.loads(data)
      return {
        "id": manifest["applications"]["zotero"]["id"],
        "version": manifest["version"],
        "name": manifest["version"],
        "unpack": False,
      }

    if zipfile.is_zipfile(addon_path):
      compressed_file = zipfile.ZipFile(addon_path, "r")
      if "manifest.json" in compressed_file.namelist():
        return parse_manifest_json(compressed_file.read("manifest.json"))

    if os.path.isdir(addon_path) and os.path.isfile(os.path.join(addon_path, 'manifest.json')):
      with open(os.path.join(addon_path, 'manifest.json')) as f:
        return parse_manifest_json(f.read())

    return super()._addon_details(addon_path)

def install_proxies(xpis, profile):
  for xpi in xpis:
    assert os.path.isdir(xpi)
    utils.print(f'installing {xpi}')
    rdf = etree.parse(os.path.join(xpi, 'install.rdf'))
    xpi_id = rdf.xpath('/rdf:RDF/rdf:Description/em:id', namespaces={'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'em': 'http://www.mozilla.org/2004/em-rdf#'})[0].text
    proxy = os.path.join(profile, 'extensions', xpi_id)
    if not os.path.isdir(os.path.dirname(proxy)):
      os.mkdir
      os.makedirs(os.path.dirname(proxy))
    elif os.path.isdir(proxy) and not os.path.islink(proxy):
      shutil.rmtree(proxy)
    elif os.path.exists(proxy):
      os.remove(proxy)
    with open(proxy, 'w') as f:
      f.write(xpi)
  
  with open(os.path.join(profile, 'prefs.js'), 'r+') as f:
    utils.print('stripping prefs.js')
    lines = f.readlines()
    f.seek(0)
    for line in lines:
      if 'extensions.lastAppBuildId' in line: continue
      if 'extensions.lastAppVersion' in line: continue
      f.write(line)
    f.truncate()

def install_xpis(path, profile):
  if not os.path.exists(path): return
  utils.print(f'Installing xpis in {path}')

  for xpi in glob.glob(os.path.join(path, '*.xpi')):
    utils.print(f'installing {xpi}')
    profile.add_extension(xpi)

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
        'timeout': 120,
        'profile': '',
        'trace_factor': 1,
      }
    ]
    trace = os.path.join(ROOT, '.trace.json')
    if os.path.exists(trace):
      with open(trace) as f:
        trace = json.load(f)
        if Repository('.').head.shorthand in trace:
          self.data[0]['trace_factor'] = 10
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

class Library:
  def __init__(self, path=None, body=None, client=None, ext=None):
    if path:
      path = os.path.join(FIXTURES, path)

    if path:
      self.ext = self.suffix(path)
    elif ext:
      if type(ext) == Library:
        self.ext = self.suffix(ext.path)
      else:
        self.ext = self.suffix(ext)
    else:
      self.ext = None

    self.base = path
    self.body = body
    self.client = client.split('-')[0]
    self.beta = '-beta' in client

    self.data = None
    self.patch = None
    self.path = None
    self.exported = None

    if self.base:
      self.path = self.base

      patches = [ self.base + '.' + client + '.patch' ]
      if self.beta: patches.append(self.base + '.' + self.client + '.patch')
      self.patch = next((patch for patch in patches if os.path.exists(patch)), None)
      if self.patch:
        self.path = self.base[:-len(self.ext)] + '.' + self.patch.split('.')[-2] + self.ext

    if not self.body and self.base and os.path.exists(self.base):
      with open(self.base) as f:
        self.body = f.read()

    self.normalized = self.body

    if self.normalized is None or self.ext is None:
      raise ValueError('need something to work with')

    #if self.base and not os.path.exists(self.base):
    #  with open(self.base, 'w') as f:
    #    f.write(self.body)

    if self.ext.endswith('.json') or self.ext == '.csl.yml':
      if self.ext.endswith('.json'):
        self.data = json.loads(self.body, object_pairs_hook=OrderedDict)
      else:
        self.data = yaml.load(io.StringIO(self.body))

      if self.patch:
        self.data = jsonpatch.JsonPatch(json.load(f)).apply(self.data)

      if self.ext in ['.csl.json', '.csl.yml']:
        self.data = sorted(self.data, key=lambda item: json.dumps(item, sort_keys=True))
        self.normalized = json.dumps(self.data, indent=2, ensure_ascii=True, sort_keys=True)

        if self.ext == '.csl.yml':
          normalized = io.StringIO()
          # re-use the key sorting from json dumps
          yaml.dump(json.loads(self.normalized), normalized)
          self.normalized = normalized.getvalue()

      elif self.ext == '.json':
        self.data['items'] = sorted(self.data['items'], key=lambda item: json.dumps(item, sort_keys=True))
        self.normalized = json.dumps(cleanlib(copy.deepcopy(self.data)), indent=2, ensure_ascii=True, sort_keys=True)

    elif self.ext in ['.biblatex', '.bibtex', '.bib']:
      if self.patch:
        dmp = diff_match_patch()
        self.body = dmp.patch_apply(dmp.patch_fromText(open(self.patch).read()), self.body)[0]
      self.normalized = sortbib(self.body)

    elif self.ext == '.html':
      self.normalized = clean_html(self.body).strip()

  def suffix(self, path):
    suffixes = Path(path).suffixes
    if suffixes[-1] == '.yaml':
      raise ValueError(f'Use .yml, not .yaml, in {path}')

    if len(suffixes) >= 2 and suffixes[-2] == '.csl' and suffixes[-1] in ['.json', '.yml']:
      return ''.join(suffixes[-2:])

    return suffixes[-1]

  def save(self, path):
    self.exported = os.path.join(EXPORTED, os.path.basename(os.path.dirname(path)), os.path.basename(path))
    Path(self.exported).parent.mkdir(parents=True, exist_ok=True)
    with open(self.exported, 'w') as f:
      f.write(self.body)

  def clean(self):
    if self.exported:
      os.remove(self.exported)
      exdir = os.path.dirname(self.exported)
      if len(os.listdir(exdir)) == 0:
        os.rmdir(exdir)

class Zotero:
  def __init__(self, userdata):
    assert not running('Zotero'), 'Zotero is running'

    self.client = userdata.get('client', 'zotero')
    self.beta = userdata.get('beta') == 'true'
    self.legacy = userdata.get('legacy') == 'true'
    self.dev = userdata.get('dev') == 'true'
    self.token = str(uuid.uuid4())
    self.import_at_start = userdata.get('import', None)
    if self.import_at_start:
      self.import_at_start = os.path.abspath(self.import_at_start)
    self.profiletemplate = userdata.get('profile', None)

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

    self.translators = Munch(byId={}, byLabel={}, bySlug={})
    for header in glob.glob(os.path.join(ROOT, 'translators/*.json')):
      with open(header) as f:
        header = json.load(f, object_hook=Munch)
        self.translators.byId[header.translatorID] = self.translators.byLabel[header.label] = self.translators.bySlug[header.label.replace(' ', '')] = header

    if userdata.get('kill', 'true') == 'true':
      atexit.register(self.shutdown)

    self.testing = userdata.get('testing', 'true') == 'true'
    self.worker = userdata.get('worker', 'true') == 'true'
    self.caching = userdata.get('caching', 'true') == 'true'

    self.preferences = Preferences(self)
    self.redir = '>'
    self.start()
    self.redir = '>>'

  def execute(self, script, **args):
    headers = {
      'Content-Type': 'application/json'
    }
    resp = requests.get(f'http://127.0.0.1:{self.port}/connector/ping')
    resp.raise_for_status()
    resp = requests.post(f'http://127.0.0.1:{self.port}/connector/ping', headers=headers, data='{}')
    resp.raise_for_status()

    for var, value in args.items():
      script = f'const {var} = {json.dumps(value)};\n' + script

    headers = {
      'Authorization': f'Bearer {self.token}',
      'Content-Type': 'application/javascript'
    }

    with Pinger(20):
      resp = requests.post(f'http://127.0.0.1:{self.port}/debug-bridge/execute', headers=headers, data=script.encode('utf-8'))
      resp.raise_for_status()
      return resp.json()

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
    self.profile = profile = self.create_profile()
    shutil.rmtree(os.path.join(profile.path, self.client, 'better-bibtex'), ignore_errors=True)

    cmd = f'{shlex.quote(profile.binary)} -P {shlex.quote(profile.name)} -jsconsole -purgecaches -ZoteroDebugText {self.redir} {shlex.quote(profile.path + ".log")} 2>&1'
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

        except requests.exceptions.RequestException:
          pass

    assert ready, f'{self.client} did not start'
    self.config.pop()

    if self.import_at_start:
      prefs = {}
      try:
        if self.import_at_start.endswith('.json'):
          with open(self.import_at_start) as f:
            data = json.load(f)
            prefs = data.get('config', {}).get('preferences', {})
        utils.print(f'import at start: {json.dumps(self.import_at_start)}, {json.dumps(prefs)}')
        self.execute('return await Zotero.BetterBibTeX.TestSupport.importFile(file, true, prefs)', file=self.import_at_start, prefs=prefs)
      except Exception as e:
        utils.print(f'failed to import at start: {json.dumps(self.import_at_start)}, {json.dumps(prefs)}')
        utils.print(traceback.format_exc())
        raise e
      self.import_at_start = None

  def reset(self, scenario):
    if self.needs_restart:
      self.shutdown()
      self.config.reset()
      self.start()

    self.execute('await Zotero.BetterBibTeX.TestSupport.reset(scenario)', scenario=scenario)
    self.preferences = Preferences(self)
    for csv in glob.glob(os.path.join(self.profile.path, 'better-bibtex', '*.csv')):
      os.remove(csv)

  def reset_cache(self):
    self.execute('await Zotero.BetterBibTeX.TestSupport.resetCache()')

  def qualifiedclient(self):
    if self.beta:
      return f'{self.client}-beta'
    else:
      return self.client

  def quick_copy(self, itemIDs, translator, expected):
    found = self.execute('return await Zotero.BetterBibTeX.TestSupport.quickCopy(itemIDs, translator)',
      translator=translator,
      itemIDs=itemIDs
    )
    expected = Library(path=expected, client=self.qualifiedclient())
    assert_equal_diff(expected.body, found.strip())

  def export_library(self, translator, displayOptions = {}, collection = None, output = None, expected = None, resetCache = False):
    assert not displayOptions.get('keepUpdated', False) or output # Auto-export needs a destination

    if translator.startswith('id:'):
      translator = translator[len('id:'):]
    else:
      translator = self.translators.byLabel[translator].translatorID

    if self.worker and 'worker' not in displayOptions:
      worker = self.translators.byId[translator].get('displayOptions', {}).get('worker', None)
      if type(worker) == bool:
        utils.print(f'{"" if worker else "not "}upgrading to worker')
        displayOptions['worker'] = worker
      else:
        utils.print(f'{translator} has no worker support')

    displayOptions['Normalize'] = True

    found = self.execute('return await Zotero.BetterBibTeX.TestSupport.exportLibrary(translatorID, displayOptions, path, collection)',
      translatorID=translator,
      displayOptions=displayOptions,
      path=output,
      collection=collection
    )
    if resetCache: self.execute('await Zotero.BetterBibTeX.TestSupport.resetCache()')

    if expected is None: return

    expected = Library(path=expected, client=self.qualifiedclient())
    found = Library(path=output, body=found, client=self.qualifiedclient(), ext=expected)
    found.save(expected.path)

    if expected.ext in ['.csl.json', '.csl.yml', '.html', '.bib', '.bibtex', '.biblatex']:
      assert_equal_diff(expected.normalized, found.normalized)

    elif expected.path.endswith('.json'):
      def summary(items):
        return [(item['itemType'], item.get('title', '')) for item in items['items']]
      assert len(expected.data['items']) == len(found.data['items']), f"found {len(found.data['items'])}, expected {len(expected.data['items'])}, {summary(found.data)}, {summary(expected.data)}"
      assert_equal_diff(expected.normalized, found.normalized)

    found.clean()

  def import_file(self, context, references, collection = False, items=True):
    assert type(collection) in [bool, str]

    input = Library(path=references, client=self.qualifiedclient())

    if input.path.endswith('.json'):
      # TODO: clean lib and test against schema
      config = input.data.get('config', {})
      preferences = config.get('preferences', {})
      localeDateOrder = config.get('localeDateOrder', None)

      displayOptions = dict(config.get('options', context.displayOptions))
      if not 'worker' in displayOptions:
        displayOptions['worker'] = context.displayOptions['worker']
      context.displayOptions = displayOptions

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
      for item in input.data['items']:
        for att in item.get('attachments') or []:
          if path := att.get('path'):
            path = os.path.join(os.path.dirname(input.path), path)
            assert os.path.exists(path), f'attachment {path} does not exist'
    else:
      preferences = None
      localeDateOrder = None

    with tempfile.TemporaryDirectory() as d:
      references = input.path
      if type(collection) is str:
        orig = references
        references = os.path.join(d, collection)
        shutil.copy(orig, references)

      if '.bib' in references:
        assert os.path.exists(references), f'{json.dumps(references)} does not exist'
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

  def create_profile(self):
    profile = Munch(
      name='BBTTEST'
    )

    profile.path = os.path.expanduser(f'~/.{profile.name}')

    profile.profiles = {
      'Linux': os.path.expanduser(f'~/.{self.client}/zotero'),
      # 'Darwin': os.path.expanduser('~/Library/Application Support/' + {'zotero': 'Zotero', 'jurism': 'Juris-M'}[self.client]),
      'Darwin': os.path.expanduser('~/Library/Application Support/Zotero'),
    }[platform.system()]
    os.makedirs(profile.profiles, exist_ok = True)

    variant = ''
    if self.beta:
      variant = '-beta'
    elif self.legacy:
      variant = '6'
    elif self.dev:
      variant = '-dev'
    profile.binary = {
      'Linux': f'/usr/lib/{self.client}{variant}/{self.client}',
      'Darwin': f'/Applications/{self.client.title()}{variant}.app/Contents/MacOS/{self.client}',
    }[platform.system()]

    # create profile
    profile.ini = os.path.join(profile.profiles, 'profiles.ini')
    utils.print(f'profile.ini={profile.ini}')

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
    utils.print(str(dict(ini[profile.id])))

    # layout profile
    if self.config.profile:
      profile.firefox = FirefoxProfile(os.path.join(ROOT, 'test/db', self.config.profile))
      profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.removeStock', False)
    else:
      profile.firefox = FirefoxProfile(os.path.join(FIXTURES, 'profile', self.profiletemplate or self.client))

    profile.firefox.set_preference('extensions.zotero.dataDir', os.path.join(profile.path, self.client))
    profile.firefox.set_preference('extensions.zotero.useDataDir', True)

    install_xpis(os.path.join(ROOT, 'xpi'), profile.firefox)

    install_xpis(os.path.join(ROOT, 'other-xpis'), profile.firefox)
    if self.config.db: install_xpis(os.path.join(ROOT, 'test/db', self.config.db, 'xpis'), profile.firefox)
    if self.config.profile: install_xpis(os.path.join(ROOT, 'test/db', self.config.profile, 'xpis'), profile.firefox)

    profile.firefox.set_preference('extensions.zotero.debug.memoryInfo', True)
    profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.testing', self.testing)
    profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.logEvents', self.testing)
    profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.caching', self.caching)
    profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.scrubDatabase', True)
    # don't nag about the Z7 beta for a day
    profile.firefox.set_preference('extensions.zotero.hiddenNotices', json.dumps({ 'crossref-outage-2024-08-21': time.time() + 86400 }))
    profile.firefox.set_preference('extensions.zotero.firstRunGuidanceShown.z7Banner', False)

    profile.firefox.set_preference('extensions.zoteroMacWordIntegration.lastAttemptedVersion', '7.0.5.SOURCE')
    profile.firefox.set_preference('extensions.zoteroMacWordIntegration.version', '7.0.5.SOURCE')

    profile.firefox.set_preference('intl.accept_languages', 'en-GB')
    profile.firefox.set_preference('intl.locale.requested', 'en-GB')

    profile.firefox.set_preference('extensions.zotero.debug-bridge.token', self.token)
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
      profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.citekeyFormat', "[auth:lower][year] | [=forumPost/WebPage][Auth:lower:capitalize][Date:format-date=%Y-%m-%d.%H\\:%M\\:%S:prefix=.][PublicationTitle:lower:capitalize:prefix=.][shorttitle3_3:lower:capitalize:prefix=.][Pages:prefix=.p.][Volume:prefix=.Vol.][NumberofVolumes:prefix=de] | [Auth:lower:capitalize][date=%oY:prefix=.][PublicationTitle:lower:capitalize:prefix=.][shorttitle3_3:lower:capitalize:prefix=.][Pages:prefix=.p.][Volume:prefix=.Vol.][NumberofVolumes:prefix=de]")

    profile.firefox.update_preferences()

    shutil.rmtree(profile.path, ignore_errors=True)
    shutil.move(profile.firefox.path, profile.path)
    os.makedirs(f'{profile.path}/zotero', exist_ok=True)
                    
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
      # db = sqlite3.connect(os.path.join(profile.path, self.client, os.path.basename(db_bbt)))
      # ae = None
      # for (ae,) in db.execute('SELECT data FROM "better-bibtex" WHERE name = ?', [ 'better-bibtex.autoexport' ]):
        # ae = json.loads(ae)
        # ae['data'] = []
      # if ae:
        # db.execute('UPDATE "better-bibtex" SET data = ? WHERE name = ?', [ json.dumps(ae), 'better-bibtex.autoexport' ])
        # db.commit()
      # db.close()

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

    with open(os.path.join(ROOT, 'schema/BetterBibTeX JSON.json')) as f:
      schema = json.load(f, object_hook=Munch)
      self.supported = {
        self.prefix + pref: {'string': str, 'boolean': bool, 'number': int}[tpe.type]
        for pref, tpe in schema.properties.config.properties.preferences.properties.items()
      }
    self.supported[self.prefix + 'removeStock'] = bool

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
