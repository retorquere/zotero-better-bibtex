#!/usr/bin/env python3

import os
import requests
from urllib.request import urlretrieve
import glob
import sys

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

url = 'https://raw.githubusercontent.com/plk/biber/dev/data/biber-tool.conf'
r = requests.head(url)
etag = r.headers['etag']
if etag.startswith('W/'): etag = etag[3:-1]
bibertool = os.path.abspath(os.path.join(root, 'translators/bibtex', etag + '.bibertool'))

if not os.path.exists(bibertool):
  urlretrieve(url, bibertool)

def relative(path):
  return os.path.abspath(f)[len(root)+1:]

remove = False
for f in glob.glob(os.path.abspath(os.path.join(root, 'translators/bibtex/*.bibertool'))):
  if f != bibertool:
    remove = True
    print('please remove', relative(f))
if remove:
  sys.exit(1)
