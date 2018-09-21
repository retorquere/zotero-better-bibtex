#!/usr/bin/env python3

import json
import os
import glob

class Fixer:
  def __init__(self):
    self.root = os.path.join(os.path.dirname(__file__), '..')
    self.supported = self.load(os.path.join(self.root, 'gen/preferences/preferences.json')).keys()

  def load(self, f):
    with open(f) as _f:
      return json.load(_f)

  def fix(self, lib):
    if lib.endswith('.csl.json'):
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

    if not resave: return

    print(f'{resave}: {lib}')

    with open(lib, 'w') as f:
      json.dump(data, f, indent=2, separators=(',', ': '), sort_keys=True)
      #add trailing newline for POSIX compatibility
      f.write('\n')

fixer = Fixer()
for lib in glob.glob(os.path.join(fixer.root, 'test/fixtures/*/*.json')):
  fixer.fix(lib)
