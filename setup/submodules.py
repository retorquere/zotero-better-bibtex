#!/usr/bin/env python3

import subprocess
import urllib.request
import textwrap
import os

if os.environ.get('CI') != 'true':
  print('updating submodules')
  online = True
  try:
    online = urllib.request.urlopen('https://github.com').getcode() == 200
  except:
    online = False

  def run(cmd):
    return textwrap.indent(subprocess.check_output(cmd.split(' ')).decode('utf-8'), '  ')

  if online:
    submodules = run('git submodule update --init --recursive --remote')
    if submodules.strip() == '': submodules = '  up to date'
    print(submodules)
    print(run('git submodule foreach git checkout'))
    print(run('git submodule foreach git pull'))
  else:
    print('  GitHub offline -- you may not have network access -- skipping submodule update')
