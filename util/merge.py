#!/usr/bin/env python3

import json
import sys
import argparse
from ruamel.yaml import YAML
from ruamel.yaml.scalarstring import LiteralScalarString

yaml_loader = YAML(typ='safe')
yaml_dumper = YAML()
yaml_dumper.indent(mapping=2, sequence=4, offset=2)
yaml_dumper.allow_unicode = False
yaml_dumper.width = float('inf')

def walk_and_style(data):
  if isinstance(data, dict):
    return {k: walk_and_style(v) for k, v in data.items()}
  elif isinstance(data, list):
    return [walk_and_style(item) for item in data]
  elif isinstance(data, str) and '\n' in data:
    return LiteralScalarString(data)
  return data


def parse_content(text):
  try:
    return json.loads(text, strict=False), 'json'
  except Exception:
    pass

  try:
    return yaml_loader.load(text), 'yaml'
  except Exception as err:
    raise ValueError('Could not parse input as JSON or YAML') from err


def load_file(path):
  with open(path) as f:
    return parse_content(f.read())


def save_file(path, data, fmt):
  with open(path, 'w') as f:
    if fmt == 'json':
      json.dump(data, f, indent='  ')
    elif fmt == 'yaml':
      yaml_dumper.dump(walk_and_style(data), f)
    else:
      raise ValueError(f'Unsupported output format {fmt}')

parser = argparse.ArgumentParser()
parser.add_argument('-c', '--config', action='store_true')
parser.add_argument('-u', '--unique', action='store_true')
parser.add_argument('libraries', type=str, nargs='+')
args = parser.parse_args()

main = args.libraries.pop(0)

data, target_format = load_file(main)

jurisM = main.endswith('.juris-m.json')

for lib in args.libraries:
  if lib.endswith('.schomd.json'): continue
  if lib.endswith('.csl.json') or lib.endswith('.csl.juris-m.json'): continue
  if not jurisM and lib.endswith('.jurism.json'): continue
  print(lib)

  lib, _ = load_file(lib)

  if args.config and 'config' in lib:
    data['config'] = lib['config']

  if 'items' in lib:
    data['items'] = data['items'] + lib['items']

if args.unique:
  data['items'] = [json.loads(item) for item in set([json.dumps(item, sort_keys=True) for item in data['items']])]

print(len(data['items']))

print('saving', main)
save_file(main, data, target_format)

data, _ = load_file(main)
if not isinstance(data, dict) or 'items' not in data:
  raise ValueError(f'{main} did not deserialize into a library with items')
else:
  print(len(data['items']))

