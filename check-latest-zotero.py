#!/usr/bin/env python

import platform
import re
import json
import os
import sys

if sys.version_info[0] >= 3:
  from urllib.request import urlopen
  from html.parser import HTMLParser
  from urllib.request import urlretrieve
  from http.client import HTTPSConnection
else:
  from urllib2 import urlopen
  from HTMLParser import HTMLParser
  from urllib import urlretrieve
  from httplib import HTTPSConnection
  input = raw_input

def released(client):
  if client == 'zotero':
    response = urlopen('https://www.zotero.org/download/').read()
    if type(response) is bytes: response = response.decode("utf-8")
    for line in response.split('\n'):
      if not '"standaloneVersions"' in line: continue
      line = re.sub(r'.*Downloads,', '', line)
      line = re.sub(r'\),', '', line)
      versions = json.loads(line)
      return versions['standaloneVersions']['linux-' + platform.machine()]

  else:
    release = HTTPSConnection('our.law.nagoya-u.ac.jp')
    release.request('GET', '/jurism/dl?channel=release&platform=linux-' + platform.machine())
    release = release.getresponse()
    release = release.getheader('Location')
    return release.split('/')[-2]

outdated = False
for client in ['zotero', 'jurism']:
  installed = os.popen("dpkg -s " + client + " | grep '^Version:'").read().strip().split(':')[1].strip()
  online = released(client)

  if installed == online:
    print('found ' + client + ' ' + installed)
  else:
    print('expected ' + client + ' ' + online + ', found ' + installed)
    outdated = True

if outdated: sys.exit(1)
