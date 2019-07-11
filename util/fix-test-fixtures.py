#!/usr/bin/env python3

import json
import os
import glob
import re
from munch import *

class Fixer:
  def __init__(self):
    self.root = os.path.join(os.path.dirname(__file__), '..')
    self.supported = munchify(self.load(os.path.join(self.root, 'gen/preferences/preferences.json')))

  def load(self, f):
    with open(f) as _f:
      return json.load(_f)

  def fix(self, lib):
    if lib.endswith('.csl.json') or lib.endswith('.schomd.json'):
      pass
      return

    if lib.endswith('.json'):
      self.fix_bbtj(lib)
      return

    raise ValueError(f"Don't know how to fix '{lib}'")

  def fix_bbtj(self, lib):
    data = self.load(lib)
    if not isinstance(data, dict):
      print(f'{lib} is not a dict')
      return
    data = munchify(data)

    resave = None

    if data.get('config', {}).get('preferences', None):
      if 'jabrefGroups' in data.config.preferences:
        data.config.preferences.jabrefFormat = data.config.preferences.jabrefGroups
        resave = 'jabrefGroups'

      if 'preserveBibTeXVariables' in data.config.preferences:
        data.config.preferences.exportBibTeXStrings = 'detect' if data.config.preferences.preserveBibTeXVariables else 'off'
        resave = 'preserveBibTeXVariables'

      if 'preserveBibTeXVariables' in data.config.preferences:
        data.config.preferences.exportBibTeXStrings = 'detect' if data.config.preferences.preserveBibTeXVariables else 'off'
        resave = 'preserveBibTeXVariables'

      if 'skipWords' in data.config.preferences and type(data.config.preferences.skipWords) == list:
        data.config.preferences.skipWords = ','.join(data.config.preferences.skipWords)
        resave = 'skipWords'

      if 'skipFields' in data.config.preferences and type(data.config.preferences.skipFields) == list:
        data.config.preferences.skipFields = ','.join(data.config.preferences.skipFields)
        resave = 'skipFields'

      if 'skipField' in data.config.preferences:
        data.config.preferences.pop('skipField')
        resave = 'skipField'

    for key in list(data.get('config', {}).get('preferences', {}).keys()): # list, otherwise python complains the dict changes during iteration
      value = data.config.preferences[key]
      if key not in self.supported:
        del data['config']['preferences'][key] 
        resave = key

    if '/export/' in lib:
      try:
        for key in list(data.config.get('options', {}).keys()):
          if key in ['exportPath']:
            del data['config']['options'][key]
            resave = key
      except KeyError:
        pass

    def valid_att(att):
      if 'url' in att: return True
      if not 'path' in att: return False
      if re.match(r'^(\/|([a-z]:\\))', att.get('path'), flags=re.IGNORECASE): return False
      if not os.path.exists(os.path.join(os.path.dirname(lib), att['path'])): return False
      return True

    for item in data['items']:
      attachments = item.get('attachments', [])
      if '/export/' in lib and len(attachments) != 0:
        attachments = [att for att in attachments if valid_att(att)]

        if attachments != item.attachments:
          item.attachments = attachments
          resave = 'attachments'

    if not resave: return

    print(f'{resave}: {lib}')

    with open(lib, 'w') as f:
      json.dump(data, f, indent=2, separators=(',', ': '), sort_keys=True)
      #add trailing newline for POSIX compatibility
      f.write('\n')

fixer = Fixer()
for lib in glob.glob(os.path.join(fixer.root, 'test/fixtures/*/*.json')):
  fixer.fix(lib)
