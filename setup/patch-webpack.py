#!/usr/bin/env python3

import os
import sys

if 'MINITESTS' in os.environ:
  sys.exit(0)

root = os.path.join(os.path.dirname(__file__), '..')

webpack = os.path.join(root, 'build/content/webpack.js')
loader = ''
wrapped = None
prefix = "if (!Zotero.WebPackedBetterBibTeX) {\n\n"
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
