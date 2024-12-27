#!/usr/bin/env python3

from functools import reduce
from diff_match_patch import diff_match_patch
import glob
import os, sys
import json, jsonpatch, jsonpath_ng as jsonpath
from urllib.parse import unquote
import shlex, shutil
from copy import deepcopy
import editor

def sort(schema):
  schema['itemTypes'] = sorted(schema['itemTypes'], key=lambda it: it['itemType'])
  return schema

def get_ext(filename):
  parts = filename.split('.')
  if len(parts) > 2 and parts[-2] in ['schomd', 'csl']: return '.'.join(parts[-2:])
  return parts[-1]

client = sys.argv[1]
source = sys.argv[2]
ext = get_ext(source)

with open(source) as f:
  _source = f.read()
_target = editor.edit(contents=_source).decode('utf-8')

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

with open(source + f'.{client}.patch', 'w') as f:
  f.write(diff)
