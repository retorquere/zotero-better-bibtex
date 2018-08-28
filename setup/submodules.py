#!/usr/bin/env python3

import subprocess
import urllib.request

print('updating submodules')
if urllib.request.urlopen('https://github.com').getcode() == 200:
  submodules = subprocess.check_output('git submodule update --init --recursive --remote'.split(' ')).decode('utf-8')
  if submodules == '': submodules = 'up to date'
  print(f'  {submodules}')
else:
  print('  GitHub offline -- you may not have network access -- skipping submodule update')
