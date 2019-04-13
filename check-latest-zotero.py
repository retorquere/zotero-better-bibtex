#!/usr/bin/env python

import platform
import re
import json
import os
import sys
import xml.etree.ElementTree as ET

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
    feed = 'https://github.com/zotero/zotero/releases.atom'
  else:
    feed = 'https://github.com/Juris-M/zotero/releases.atom'

    #response = urlopen('https://github.com/Juris-M/assets/releases/download/client%2Freleases%2Fincrementals-linux/incrementals-release-linux').read()
    #if type(response) is bytes: response = response.decode("utf-8")
    #release = sorted(response.split('\n'))[-1]
    #return release

  response = urlopen(feed).read()
  if type(response) is bytes: response = response.decode("utf-8")
  root = ET.fromstring(response)
  version = root.find('{http://www.w3.org/2005/Atom}entry/{http://www.w3.org/2005/Atom}id').text
  return version.split('/')[-1]

outdated = False
for client in ['zotero', 'jurism']:
  try:
    installed = os.popen("dpkg -s " + client + " 2>null | grep '^Version:'").read().strip().split(':')[1].strip()

    installed = [v for v in re.split(r'([a-z]+)', installed) if v != '']
    ppa_version = int(installed.pop())
    installed.pop()
    installed = ''.join(installed)

  except:
    installed = 'none'

  online = released(client)
  print(online)

  if installed == online:
    print('found ' + client + ' ' + installed)
  else:
    print('expected ' + client + ' ' + online + ', found ' + installed)
    outdated = True

if outdated: sys.exit(1)
