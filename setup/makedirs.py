#!/usr/bin/env python3

import shutil
import os.path

root = os.path.join(os.path.dirname(__file__), '..')

print('make build dirs')
for d in ['build', 'build/resource/abbrev', 'build/resource/jieba', 'build/resource/unabbrev', 'gen', 'gen/typings', 'xpi']:
  print('  creating', d)
  d = os.path.join(root, d)
  if os.path.isdir(d): shutil.rmtree(d)
  os.makedirs(d, exist_ok=True)
