#!/usr/bin/env python3

import argparse
import json
from pathlib import Path

from ruamel.yaml import YAML

LIBRARY_DUMP_ID = '36a3b0b5-bad0-4a04-b79b-441c7cef77db'

def get_candidates(cwd: Path):
  return sorted([
    path for path in cwd.iterdir()
    if path.is_file() and path.suffix.lower() in ['.json', '.yaml']
  ], key=lambda path: path.name)


def load_file(path: Path, yaml: YAML):
  text = path.read_text(encoding='utf-8')
  if path.suffix.lower() == '.json':
    return json.loads(text), 'json'
  return yaml.load(text), 'yaml'


def save_file(path: Path, data, fmt: str, yaml: YAML):
  with path.open('w', encoding='utf-8') as f:
    if fmt == 'json':
      json.dump(data, f, indent=2, ensure_ascii=False)
      f.write('\n')
    else:
      yaml.dump(data, f)

def migrate(path: Path, yaml: YAML, dry_run: bool):
  try:
    data, fmt = load_file(path, yaml)
  except Exception as err:
    print(f'SKIP {path.name}: parse error ({err})')
    return False

  if not isinstance(data, dict):
    print(f'SKIP {path.name}: top-level is not an object')
    return False

  config = data.get('config')
  if not isinstance(config, dict):
    print(f'SKIP {path.name}: missing config object')
    return False

  if config.get('id') != LIBRARY_DUMP_ID:
    print(f'SKIP {path.name}: not a library dump')
    return False

  preferences = config.get('preferences', {})
  if not isinstance(preferences, dict):
    print(f'SKIP {path.name}: missing config.preferences object')
    return False

  save = False

  if (v := preferences.pop('autoAbbrev', None)) is not None:
    preferences['journalAbbreviation'] = 'abbrev+auto' if v else 'auto'
    save = True

  if (v := preferences.pop('startupProgress', None)) is not None:
    save = True

  if not save:
    print(f'SKIP {path.name}: no migratable preferences found')
    return False

  if dry_run:
    print(f'WOULD-MIGRATE {path.name}')
  else:
    save_file(path, data, fmt, yaml)
    print(f'MIGRATED {path.name}')

  return True


def main():
  parser = argparse.ArgumentParser(
    description='Migrate config.preferences.autoAbbrev to config.preferences.journalAbbreviation in library dumps in the current directory'
  )
  parser.add_argument('--dry-run', action='store_true', help='show what would change without writing files')
  args = parser.parse_args()

  cwd = Path.cwd()
  candidates = get_candidates(cwd)

  print('Scanning .json/.yaml files in', cwd)
  if not candidates:
    print('No .json or .yaml files found')
    return

  for path in candidates:
    print('-', path.name)

  yaml = YAML(typ='rt')
  changed = 0
  for path in candidates:
    if migrate(path, yaml, args.dry_run):
      changed += 1

  action = 'would be migrated' if args.dry_run else 'migrated'
  print(f'\nDone: {changed} file(s) {action}.')


if __name__ == '__main__':
  main()
