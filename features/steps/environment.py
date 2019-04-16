import toml
import munch
import zotero
import time
import os
import json
import platform
import glob
import configparser
import shutil
from selenium import webdriver

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

import atexit
zoteropid = None
def killzotero():
  global zoteropid
  if zoteropid is None: return

  # graceful shutdown
  zotero.execute("""
    const appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].getService(Components.interfaces.nsIAppStartup);
    appStartup.quit(Components.interfaces.nsIAppStartup.eAttemptQuit);
  """)

  stopped = False
  for _ in range(5):
    sleep(1)
    try:
      os.kill(pid, 0)
    except OSError:
      pass
    else:
      stopped = true
      break
  
  if not stopped: os.kill(zoteropid, signal.SIGKILL)
atexit.register(killzotero)

def nested_dict_iter(nested, root = []):
  for key, value in nested.items():
    if isinstance(value, dict):
      for inner_key, inner_value in nested_dict_iter(value, root + [key]):
        yield inner_key, inner_value
    else:
      yield '.'.join(root) + '.' + key, value

def before_all(context):
  global zoteropid

  with open(os.path.join(ROOT, 'gen/translators.json')) as f:
    context.translators = json.load(f)

  home = os.path.expanduser(os.environ.get('TRAVIS_BUILD_DIR', None) or os.environ.get('CIRCLE_WORKING_DIR', None) or '~')
  zotero.CLIENT = context.config.userdata.get('zotero', 'zotero')
  platform_client = platform.system() + ':' + zotero.CLIENT

  if platform_client == 'Linux:zotero':
    profiles = os.path.expanduser('~/.zotero/zotero')
    binary = '/usr/lib/zotero/zotero'
  elif platform_client == 'Linux:jurism':
    profiles = os.path.expanduser('~/.jurism/zotero')
    binary = '/usr/lib/jurism/jurism'
  elif platform_client == 'Darwin:zotero':
    profiles = os.path.expanduser('~/Library/Application Support/Zotero')
    binary = '/Applications/Zotero.app/Contents/MacOS/zotero'
  else:
    assert platform_client in ['Linux:zotero', 'Linux:jurism', 'Darwin:zotero']

  plugins = glob.glob(os.path.join(ROOT, 'xpi/*.xpi'))
  os.makedirs(profiles, exist_ok = True)

  profile = munch.Munch()
  profile.name = 'BBTZ5TEST'
  profile.path = os.path.expanduser(f'~/.{profile.name}')
  profile.ini_path = os.path.join(profiles, 'profiles.ini')

  profile.ini = configparser.RawConfigParser()
  profile.ini.optionxform = str
  if os.path.exists(profile.ini_path): profile.ini.read(profile.ini_path)

  if not profile.ini.has_section('General'): profile.ini.add_section('General')
  profile.id = None
  for p in profile.ini.sections():
    for k, v in profile.ini.items(p):
      if k == 'Name' and v == profile.name: profile.id = p
  if not profile.id:
    free = 0
    while True:
      profile.id = f'Profile{free}'
      if not profile.id in profile.ini.sections(): break
      free += 1
    profile.ini.set(profile.id, 'Name', profile.name)

  profile.ini.set(profile.id, 'IsRelative', 0)
  profile.ini.set(profile.id, 'Path', profile.path)
  profile.ini.set(profile.id, 'Default', None)
  with open(profile.ini_path, 'w') as f:
    profile.ini.write(f, space_around_delimiters=False)

  fixtures = os.path.join(ROOT, 'test/fixtures')
  profile.firefox = webdriver.FirefoxProfile(os.path.join(fixtures, 'profile', zotero.CLIENT))

  with open(os.path.join(os.path.dirname(__file__), 'preferences.toml')) as f:
    preferences = toml.load(f)
    for p, v in nested_dict_iter(preferences['general']):
      profile.firefox.set_preference(p, v)

    if context.config.userdata.get('locale', '') == 'fr':
      for p, v in nested_dict_iter(preferences['fr']):
        profile.firefox.set_preference(p, v)

  if context.config.userdata.get('first-run', 'false') == 'false':
    profile.firefox.set_preference('extensions.zotero.translators.better-bibtex.citekeyFormat', '[auth][shorttitle][year]')
  profile.firefox.update_preferences()

  shutil.rmtree(profile.path, ignore_errors=True)
  shutil.move(profile.firefox.path, profile.path)

  zoteropid = os.fork()
  if zoteropid == 0:
    fdout = os.open(os.path.expanduser('~/.BBTZ5TEST.log'), os.O_WRONLY)
    os.dup2(fdout, 1)
    os.execvp(binary, [binary, '-P', profile.name, '-ZoteroDebugText', '-datadir', 'profile'])
    assert False, f'error starting {zotero.CLIENT}'

  if os.environ.get('KILL', 'true') == 'false': zoteropid = None

  with benchmark(f'starting {zotero.CLIENT}'):
    for _ in retrier(sleeptime=1):
      running = zotero.execute("""
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
      if running: break

  # test whether the existing references, if any, have gotten a cite key
  exportLibrary(translator = 'Better BibTeX', expected = None)

  profile.user_js = os.path.join(profile.path, 'user.js')
  if os.path.exists(profile.user_js): os.remove(profile.user_js)

def before_scenario(context, scenario):
  print('before_scenario')
  context.preferences = zotero.Preferences()
  context.displayOptions = {}
