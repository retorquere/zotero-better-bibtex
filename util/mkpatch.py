#!/usr/bin/env python3

from functools import reduce
from diff_match_patch import diff_match_patch
import glob
import os, sys
import json, jsonpatch, jsonpath_ng as jsonpath
from urllib.parse import unquote
import shlex
from copy import deepcopy

def sort(schema):
  schema['itemTypes'] = sorted(schema['itemTypes'], key=lambda it: it['itemType'])
  return schema

def get_ext(filename):
  if filename[0] == '.': return ''
  if filename.endswith('.patch'): return ''

  parts = filename.split('.')

  for i in [3, 2]:
    if len(parts) > i and parts[-i] in ['juris-m', 'jurism', 'zotero-beta']: return '.'.join(parts[-i:])
  if len(parts) > 2 and parts[-2] in ['schomd', 'csl']: return '.'.join(parts[-2:])
  return parts[-1]

def patch2path(_patch):
  assert _patch[0] == '/', _patch
  _path = '$'
  for p in _patch[1:].split('/'):
    try:
      _path += f'[{int(p)}]'
    except:
      _path += f'.{p}'
  return _path

patches = []
for target in glob.glob('test/fixtures/*/*.*'):
  ext = get_ext(target)
  alt = next((a for a in ['juris-m.', 'jurism.', 'zotero-beta.'] if ext.startswith(a)), None)
  print(target, ext, alt)
  if alt:
    source = target[:-len(ext)] + ext.replace(alt, '')
  else:
    continue

  print(target)
  with open(source) as f:
    _source = f.read()
  with open(target) as f:
    _target = f.read()

  if ext.endswith('.json'):
    _progress = json.loads(_source)
    _source = json.loads(_source)
    _target = json.loads(_target)
    diff = json.loads(str(jsonpatch.make_patch(_source, _target)))
    # add dummy value for legibility
    for op in diff:
      if op['op'] == 'move' and not 'value' in op:
        value = next((x.value for x in jsonpath.parse(patch2path(op['from'])).find(_progress)), None)
        assert value is not None, op
      elif op['op'] == 'remove' and not 'value' in op:
        value = next((x.value for x in jsonpath.parse(patch2path(op['path'])).find(_progress)), None)
        assert value is not None, op
      else:
        value = None

      _progress = jsonpatch.apply_patch(_progress, [op])

      if not value is None:
        op[':value'] = value

    diff = json.dumps(diff, indent='  ')
  else:
    dmp = diff_match_patch()
    patch = dmp.patch_make(_source, _target)
    diff = dmp.patch_toText(patch)

  patch = source + '.' + alt.replace('.', '') + '.patch'
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

print(patches)
with open('patches.sh', 'w') as f:
  print(' '.join(['vi'] + patches), file=f)
