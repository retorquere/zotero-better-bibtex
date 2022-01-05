#!/usr/bin/env python3

import os
import requests
from urllib.request import urlretrieve
import glob
import sys
import xml.etree.cElementTree as ET

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

url = 'https://raw.githubusercontent.com/plk/biber/dev/data/biber-tool.conf'
r = requests.head(url)
etag = r.headers['etag']
if etag.startswith('W/'): etag = etag[3:-1]

conf = os.path.abspath(os.path.join(root, 'translators/bibtex/biber-tool.conf'))
if os.path.exists(conf):
  et = ET.parse(conf)
  stored = et.getroot().get('version')
  if stored != etag:
    print('upgrade biber-tool.conf from', stored, 'to', etag)
    os.remove(conf)

if not os.path.exists(conf):
  if 'CI' in os.environ:
    print('please upgrade', os.path.abspath(conf)[len(root)+1:])
    sys.exit(1)

  urlretrieve(url, conf)
  et = ET.parse(conf)
  et.getroot().set('version', etag)
  et.write(conf)
