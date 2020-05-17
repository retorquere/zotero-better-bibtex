#!/usr/bin/env python3

from functools import reduce
from diff_match_patch import diff_match_patch
import glob
import os, sys
import json, jsonpatch
from urllib.parse import unquote
import shlex

def sort(schema):
  schema['itemTypes'] = sorted(schema['itemTypes'], key=lambda it: it['itemType'])
  return schema

def get_ext(filename):
  if filename[0] == '.': return ''
  if filename.endswith('.patch'): return ''

  parts = filename.split('.')

  for i in [3, 2]:
    if len(parts) > i and parts[-i] == 'juris-m': return '.'.join(parts[-i:])
  if len(parts) > 2 and parts[-2] in ['schomd', 'csl']: return '.'.join(parts[-2:])
  return parts[-1]

def walk(obj, key):
  if type(obj) == dict:
    return obj[key]
  return obj[int(key)]

patches = []
for target in glob.glob('test/fixtures/*/*.*'):
  ext = get_ext(target)
  if not ext.startswith('juris-m.'): continue

  source = target[:-len(ext)] + ext.replace('juris-m.', '')

  with open(source) as f:
    _source = f.read()
  with open(target) as f:
    _target = f.read()

  if ext.endswith('.json'):
    _source = json.loads(_source)
    _target = json.loads(_target)
    diff = json.loads(str(jsonpatch.make_patch(_source, _target)))
    for op in diff:
      if op['op'] == 'move' and not 'value' in op:
        value = reduce(lambda a, b: walk(a, b) if type(a) in [list, dict] else walk(walk(_source, a), b), op['from'][1:].split('/'))
      elif op['op'] == 'remove' and not 'value' in op:
        value = reduce(lambda a, b: walk(a, b) if type(a) in [list, dict] else walk(walk(_source, a), b), op['path'][1:].split('/'))
      else:
        value = None
      if not value is None:
        op['value'] = value
    diff = json.dumps(diff, indent='  ')
  else:
    dmp = diff_match_patch()
    patch = dmp.patch_make(_source, _target)
    diff = dmp.patch_toText(patch)

  patch = source + '.jurism.patch'
  patches.append(shlex.quote(patch))

  if os.path.exists(patch):
    with open(patch) as f:
      if f.read() != diff:
        print(json.dumps(patch), 'exists but is out of date')
        sys.exit(1)
  else:
    with open(patch, 'w') as f:
      f.write(diff)
  # remove target now diff exists
  os.remove(target)

with open('patches.sh', 'w') as f:
  print(' '.join(['vi'] + patches), file=f)
