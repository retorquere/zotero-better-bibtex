#!/usr/bin/env python3

import subprocess
import urllib.request
import textwrap
import os
import configparser
from contextlib import contextmanager
from pathlib import Path

@contextmanager
def chdir(path):
  origin = Path().absolute()
  try:
    os.chdir(str(Path(path).absolute()))
    yield
  finally:
    os.chdir(origin)

if os.environ.get('CI') != 'true':
  print('updating submodules')
  online = True
  try:
    online = urllib.request.urlopen('https://github.com').getcode() == 200
  except:
    online = False

  def run(path, cmd):
    with chdir(path):
      return textwrap.indent(subprocess.check_output(cmd.split(' ')).decode('utf-8'), '  ')

  if online:
    root = str(Path(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')).absolute())

    submodules = run(root, 'git submodule update --init --recursive --remote')
    if submodules.strip() == '': submodules = '  up to date'
    print(submodules)

    gitmodules = configparser.ConfigParser()
    gitmodules.read(os.path.join(root, '.gitmodules'))
    for section, module in gitmodules.items():
      if 'submodule ' in section:
        print(section)
        print(' ', run(os.path.join(root, module['path']), 'git checkout ' + module['branch']))
        print(' ', run(os.path.join(root, module['path']), 'git pull'))
        print(' ', run(root, 'git add ' + module['path']))

  else:
    print('  GitHub offline -- you may not have network access -- skipping submodule update')
