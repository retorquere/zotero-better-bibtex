import shlex
import redo
import toml
import munch
import zotero
import time
import os
import sys
import json
import platform
import glob
import configparser
import shutil
import urllib
from selenium import webdriver
import subprocess
import psutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))

class benchmark(object):
  def __init__(self,name):
    self.name = name
  def __enter__(self):
    self.start = time.time()
  def __exit__(self,ty,val,tb):
    end = time.time()
    print("%s : %0.3f seconds" % (self.name, end-self.start))
    return False

def running(id):
  if type(id) == int:
    try:
      os.kill(id, 0)
      return False
    except OSError:
      return True

  if platform.system() == 'Darwin':
    count = int(subprocess.check_output(['osascript', '-e', 'tell application "System Events"', '-e', f'count (every process whose name is "{id}")', '-e', 'end tell']).strip())
    return count > 0

  for proc in psutil.process_iter():
    try:
      # Check if process name contains the given name string.
      if id.lower() in proc.name().lower():
        return True
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
      pass

  return False

import atexit
zoteroproc = None
def killzotero():
  global zoteroproc
  if zoteroproc is None: return

  # graceful shutdown
  try:
    zotero.execute("""
      const appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].getService(Components.interfaces.nsIAppStartup);
      appStartup.quit(Components.interfaces.nsIAppStartup.eAttemptQuit);
    """)
  except:
    pass

  stopped = False
  for _ in redo.retrier(attempts=5,sleeptime=1):
    stopped = not running(zoteroproc.pid)
    if stopped: break

  zoteroproc = psutil.Process(zoteroproc.pid)
  for proc in zoteroproc.children(recursive=True):
    proc.kill()
  zoteroproc.kill()
atexit.register(killzotero)

def nested_dict_iter(nested, root = []):
  for key, value in nested.items():
    if isinstance(value, dict):
      for inner_key, inner_value in nested_dict_iter(value, root + [key]):
        yield inner_key, inner_value
    else:
      yield '.'.join(root) + '.' + key, value

class Profile:
  def __init__(self, context, name):
    self.running = None
    self.name = name
    self.context = context

    platform_client = platform.system() + ':' + zotero.client.id

    if platform_client == 'Linux:zotero':
      self.profiles = os.path.expanduser('~/.zotero/zotero')
      self.binary = '/usr/lib/zotero/zotero'
    elif platform_client == 'Linux:jurism':
      self.profiles = os.path.expanduser('~/.jurism/zotero')
      self.binary = '/usr/lib/jurism/jurism'
    elif platform_client == 'Darwin:zotero':
      self.profiles = os.path.expanduser('~/Library/Application Support/Zotero')
      self.binary = '/Applications/Zotero.app/Contents/MacOS/zotero'
    else:
      raise ValueError(f'Unsupported test environment {platform_client}')

    os.makedirs(self.profiles, exist_ok = True)
    self.path = os.path.expanduser(f'~/.{self.name}')

    self.create()
    self.layout()

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

  def layout(self):
    fixtures = os.path.join(ROOT, 'test/fixtures')
    profile = webdriver.FirefoxProfile(os.path.join(fixtures, 'profile', zotero.client.id))

    for xpi in glob.glob(os.path.join(ROOT, 'xpi/*.xpi')):
      profile.add_extension(xpi)

    profile.set_preference('extensions.zotero.translators.better-bibtex.testing', 'true')

    with open(os.path.join(os.path.dirname(__file__), 'preferences.toml')) as f:
      preferences = toml.load(f)
      for p, v in nested_dict_iter(preferences['general']):
        profile.set_preference(p, v)

      if self.context.config.userdata.get('locale', '') == 'fr':
        for p, v in nested_dict_iter(preferences['fr']):
          profile.firefox.set_preference(p, v)

    if self.context.config.userdata.get('first-run', 'false') == 'false':
      profile.set_preference('extensions.zotero.translators.better-bibtex.citekeyFormat', '[auth][shorttitle][year]')

    if zotero.client.jurism:
      print('\n\n** WORKAROUNDS FOR JURIS-M IN PLACE -- SEE https://github.com/Juris-M/zotero/issues/34 **\n\n')
      #profile.set_preference('extensions.zotero.dataDir', os.path.join(self.path, 'jurism'))
      #profile.set_preference('extensions.zotero.useDataDir', True)
      #profile.set_preference('extensions.zotero.translators.better-bibtex.removeStock', False)

    profile.update_preferences()

    shutil.rmtree(self.path, ignore_errors=True)
    shutil.move(profile.path, self.path)

  def start(self):
    cmd = f'{shlex.quote(self.binary)} -P {shlex.quote(self.name)} -ZoteroDebugText -datadir profile &> {shlex.quote(self.path + ".log")}'
    print(f'Starting {zotero.client.id}: {cmd}')
    proc = subprocess.Popen(cmd, shell=True)
    print(f'{zotero.client.id} started: {proc.pid}')
    if self.context.config.userdata.get('kill', 'true') == 'false': return None
    return proc

def before_all(context):
  global zoteroproc
  zotero.client = zotero.Client(context.config)

  assert not running('Zotero'), 'Zotero is running'

  with open(os.path.join(ROOT, 'gen/translators.json')) as f:
    context.translators = json.load(f)

  profile = Profile(context, 'BBTZ5TEST')
  zoteroproc = profile.start()

  ready = False
  with benchmark(f'starting {zotero.client.id}'):
    for _ in redo.retrier(attempts=30,sleeptime=1):
      print('connecting...')
      try:
        ready = zotero.execute("""
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
          Zotero.debug('{better-bibtex:debug bridge}: startup: BetterBibTeX ready!');
          return true;
        """)
        if ready: break
      except (urllib.error.HTTPError, urllib.error.URLError):
        pass
  assert ready

  # test whether the existing references, if any, have gotten a cite key
  zotero.export_library(translator = 'Better BibTeX')

def before_scenario(context, scenario):
  zotero.execute('await Zotero.BetterBibTeX.TestSupport.reset()')
  context.preferences = zotero.Preferences()
  context.displayOptions = {}
  context.selected = None
  context.picked = []
