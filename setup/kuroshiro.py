#!/usr/bin/env python3

import subprocess
import glob
import os
import shutil
import gzip

root = os.path.join(os.path.dirname(__file__), '..')

unzipped = os.path.join(root, 'build/resource/kuromoji')
os.makedirs(unzipped, exist_ok=True)

def run(cmd):
  print(' ', subprocess.check_output(cmd, shell=True).decode('utf-8').strip())

print('copying kuromoji dicts...')
for dic in sorted(glob.glob(os.path.join(root, 'node_modules/kuromoji/dict/*.gz'))):
  base = os.path.basename(dic).replace('.gz', '')
  print(' ', base)
  dat = os.path.join(unzipped, base)
  os.makedirs(os.path.dirname(dat), exist_ok=True)
  with gzip.open(dic, 'rb') as f_in, open(dat, 'wb') as f_out:
    shutil.copyfileobj(f_in, f_out)

print('patching kuroshiro')
run('patch -u -p0 -o node_modules/kuroshiro/src/core-sync.js < setup/kuroshiro.patch')
run('patch -u -p0 -o node_modules/kuroshiro-analyzer-kuromoji/src/kuroshiro-analyzer-kuromoji-sync.js < setup/kuroshiro-analyzer-kuromoji-sync.patch')
print('patching lokijs')
try:
  run('patch --forward -u -p0 < setup/lokijs.patch')
except:
  pass
