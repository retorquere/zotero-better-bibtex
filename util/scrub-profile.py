#!/usr/bin/env python3

import os
import glob
import shutil
import fileinput
import json
import sys
from configparser import ConfigParser

root = os.path.expanduser('~/.BBTTEST')

false = False
true = True

def user_pref(key, value):
  global user_pref_key
  global user_pref_value
  user_pref_key = key
  user_pref_value = value

for client in ['zotero', 'jurism']:
  bbt = os.path.join(root, client, 'better-bibtex')
  if os.path.exists(bbt): shutil.rmtree(bbt)

  bbt = os.path.join(root, client, 'better-bibtex.sqlite')
  if os.path.exists(bbt): os.remove(bbt)

  for bbt in glob.glob(os.path.join(root, client, 'translators', '*.js')):
    name = os.path.basename(bbt)
    if name.startswith('Better') or name == 'Collected notes.js' or name == 'Citation graph.js':
      os.remove(bbt)

  for bbt in ['better-bibtex', 'debug-bridge']:
    bbt = os.path.join(root, f'extensions/{bbt}@iris-advies.com')
    if os.path.exists(bbt): shutil.rmtree(bbt)

  prefs = os.path.join(root, 'prefs.js')
  with open(prefs) as f:
    lines = f.readlines()
  with open(prefs, 'w') as f:
    for line in lines:
      if line.startswith('user_pref("'):
        js = line.strip()
        if js[-1] == ';': js = js[:-1]
        eval(js)

      if line.startswith('user_pref("extensions.zotero.translators.better-bibtex.'): continue

      if line.startswith('user_pref("extensions.xpiState",'):
        xpiState = json.loads(user_pref_value)
        if 'app-profile' in xpiState:
          xpiState['app-profile'].pop('debug-bridge@iris-advies.com', None)
          xpiState['app-profile'].pop('better-bibtex@iris-advies.com', None)
          if len(xpiState['app-profile']) == 0: xpiState.pop('app-profile')
        print(f'user_pref({json.dumps(user_pref_key)}, {json.dumps(json.dumps(xpiState))});', file=f)
        continue

      if line.startswith('user_pref("extensions.enabledAddons",'):
        enabledAddons = [addon for addon in user_pref_value.split(',') if not addon.startswith('debug-bridge%40iris-advies.com') and not addon.startswith('better-bibtex%40iris-advies.com')]
        print(f'user_pref({json.dumps(user_pref_key)}, {json.dumps(",".join(enabledAddons))});', file=f)
        continue

      if line.startswith('user_pref("extensions.zotero.pane.persist"'):
        persist = json.loads(user_pref_value)
        persist.pop('zotero-items-column-citekey', None)
        print(f'user_pref({json.dumps(user_pref_key)}, {json.dumps(json.dumps(persist))});', file=f)
        continue

      print(line, file=f, end='')

  _extensions = os.path.join(root, 'extensions.json')
  with open(_extensions) as f:
    extensions = json.load(f)
  with open(_extensions, 'w') as f:
    extensions['addons'] = [ext for ext in extensions['addons'] if ext['id'] not in ['debug-bridge@iris-advies.com', 'better-bibtex@iris-advies.com']]
    f.write(json.dumps(extensions))

  _extensions = os.path.join(root, 'extensions.ini')
  config = ConfigParser()
  config.read(_extensions)
  for section in config.sections():
    if section in ['ExtensionDirs', 'MultiprocessIncompatibleExtensions']:
      for key in config[section]:
        if os.path.basename(config[section][key]) in ['debug-bridge@iris-advies.com', 'better-bibtex@iris-advies.com']:
          del config[section][key]
  with open(_extensions, 'w') as f:
    config.write(f)
