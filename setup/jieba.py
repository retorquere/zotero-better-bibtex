#!/usr/bin/env python3

import os, glob, shutil

print('copying jieba assets')
os.makedirs('build/content/resource/ooooevan-jieba/dict', exist_ok=True)
for asset in glob.glob('node_modules/ooooevan-jieba/dict/*'):
  print(' ', os.path.basename(asset))
  shutil.copy(asset, os.path.join('build/content/resource/ooooevan-jieba/dict', os.path.basename(asset)))
