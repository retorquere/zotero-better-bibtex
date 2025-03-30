#!/usr/bin/env python3

import subprocess
import glob
import os
import shutil
import gzip

root = os.path.join(os.path.dirname(__file__), '..')

unzipped = os.path.join(root, 'build/content/resource/kuromoji')
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

jieba = os.path.join(root, 'build/content/resource/jieba')
os.makedirs(jieba, exist_ok=True)
shutil.copyfile('node_modules/wasmjieba-web/wasmjieba-web_bg.wasm', 'build/content/resource/jieba/wasmjieba-web_bg.wasm')
