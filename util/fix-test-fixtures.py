#!/usr/bin/env python3

import json
import os
import glob
import re

class Fixer:
  def __init__(self):
    self.root = os.path.join(os.path.dirname(__file__), '..')
    self.supported = self.load(os.path.join(self.root, 'gen/preferences/preferences.json')).keys()

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

    resave = None

    try:
      for key in list(data['config']['preferences'].keys()):
        if key in self.supported: continue
        del data['config']['preferences'][key] 
        resave = key
    except KeyError:
      pass

    if '/export/' in lib:
      try:
        for key in list(data['config']['options'].keys()):
          if key in ['exportPath']:
            del data['config']['options'][key]
            resave = key
      except KeyError:
        pass

    def valid_att(att):
      if not 'path' in att: return False
      if re.match(r'^(\/|([a-z]:\\))', att.get('path'), flags=re.IGNORECASE): return False
      if not os.path.exists(os.path.join(os.path.dirname(lib), att['path'])): return False
      return True

    for item in data['items']:
      attachments = item.get('attachments', [])
      if '/export/' in lib and len(attachments) != 0:
        attachments = [att for att in attachments if valid_att(att)]

        if attachments != item['attachments']:
          item['attachments'] = attachments
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
