#!/usr/bin/env python3

import subprocess
import glob
import os
import shutil
import gzip
import json

root = os.path.join(os.path.dirname(__file__), '..')

dicts_tgt = os.path.join(root, 'build/content/resource/kuromoji')
os.makedirs(dicts_tgt, exist_ok=True)

def run(cmd):
  print(' ', subprocess.check_output(cmd, shell=True).decode('utf-8').strip())

with open(os.path.join(root, 'node_modules/kuromoji/package.json')) as f:
  pkg = json.load(f)
print('copying kuromoji dicts', pkg['version'])

for src in sorted(glob.glob(os.path.join(root, 'node_modules/kuromoji/dict/*.gz'))):
  dict_name = os.path.basename(src)
  print(' ', dict_name)
  tgt = os.path.join(dicts_tgt, dict_name)
  os.makedirs(os.path.dirname(tgt), exist_ok=True)
  #with gzip.open(src, 'rb') as f_in, open(tgt.replace('.gz', ''), 'wb') as f_out:
  #  shutil.copyfileobj(f_in, f_out)
  shutil.copy(src, tgt)

jieba = os.path.join(root, 'build/content/resource/jieba')
os.makedirs(jieba, exist_ok=True)
shutil.copyfile('node_modules/wasmjieba-web/wasmjieba-web_bg.wasm', 'build/content/resource/jieba/wasmjieba-web_bg.wasm')
