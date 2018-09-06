#!/usr/bin/env python3

import subprocess
import urllib.request

print('updating submodules')
online = True
try:
  online = urllib.request.urlopen('https://github.com').getcode() == 200
except:
  online = False

if online:
  submodules = subprocess.check_output('git submodule update --init --recursive --remote'.split(' ')).decode('utf-8')
  if submodules == '': submodules = 'up to date'
  print(f'  {submodules}')
else:
  print('  GitHub offline -- you may not have network access -- skipping submodule update')
