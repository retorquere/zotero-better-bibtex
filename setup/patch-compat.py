#!/usr/bin/env python3

import os
import glob
import json
import xml.dom.minidom as minidom
import json
import packaging.version
import subprocess

install = minidom.parse('build/install.rdf')
ta = install.getElementsByTagNameNS('*', 'targetApplication')[0]

def max_version(v1, v2):
  if packaging.version.parse(v1.replace('m', '.')) > packaging.version.parse(v2.replace('m', '.')):
    return v1
  else:
    return v2

with open('schema/supported.json') as f:
  min_version = json.load(f)

for client, version in min_version.items():
  client = {'zotero': 'zotero@chnm.gmu.edu', 'jurism': 'juris-m@juris-m.github.io' }[client]
  _id = next(node for node in ta.getElementsByTagNameNS('*', 'id') if node.firstChild.nodeValue == client)
  for node in _id.parentNode.getElementsByTagNameNS('*', 'minVersion'):
    listed = node.firstChild.nodeValue
    supported = max_version(listed, version)
    if supported == listed:
      print('minimum overlay', client, 'version', supported)
    else:
      node.firstChild.replaceWholeText(supported)
      print('minimum overlay', client, 'bumped from', listed, 'to', supported)
with open('build/install.rdf', 'w') as f:
  install.writexml(f)

with open('build/manifest.json') as f:
  manifest = json.load(f)
for client, version in min_version.items():
  if client not in manifest['applications']: continue
  listed = manifest['applications'][client]['strict_min_version']
  supported = max_version(listed, version)

  if 'CI' in os.environ:
    branch = subprocess.run('git branch --show-current'.split(' '), stdout=subprocess.PIPE).stdout.decode('utf-8').strip()
    if branch != 'gh-2522':
      supported = '8.0'

  if supported == listed:
    print('minimum bootstrapped', client, 'version', supported)
  else:
    manifest['applications'][client]['strict_min_version'] = supported
    print('minimum bootstrapped', client, 'bumped from', listed, 'to', supported)
with open('build/manifest.json', 'w') as f:
  json.dump(manifest, f, indent='  ')
