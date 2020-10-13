#!/usr/bin/env python3

import os
import sys
import hashlib
import glob
import json
import datetime

if 'MINITESTS' in os.environ:
  sys.exit(0)

root = os.path.join(os.path.dirname(__file__), '..')

webpack = os.path.join(root, 'build/content/webpack.js')
loader = ''
wrapped = None
prefix = "if (!Zotero.webpackChunkBetterBibTeX) {\n\n"
postfix = "\n\n}\n"

with open(webpack) as f:
  for line in f.readlines():
    if wrapped is None:
      wrapped = (line.strip() == prefix.strip())
      if not wrapped: loader = prefix
    loader += line
  if not wrapped: loader += postfix

with open(webpack, 'w') as f:
  f.write(loader)

lastUpdated = datetime.datetime.now().isoformat().replace('T', ' ').split('.')[0]

for header in glob.glob(os.path.join(root, 'translators', '*.json')):
  with open(header) as f:
    metadata = json.load(f)
  with open(os.path.join(root, 'build', 'resource', metadata['label'] + '.js')) as f:
    if not 'configOptions' in metadata: metadata['configOptions'] = {}
    metadata['configOptions']['hash'] = hashlib.sha256(f.read().encode('utf-8')).hexdigest()
    metadata['lastUpdated'] = lastUpdated
  with open(os.path.join(root, 'build', 'resource', os.path.basename(header)), 'w') as f:
    json.dump(metadata, f, indent='  ')
