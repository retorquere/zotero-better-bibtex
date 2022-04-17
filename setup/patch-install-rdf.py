#!/usr/bin/env python3

import glob
import json
import xml.dom.minidom as minidom
import json

install = minidom.parse('build/install.rdf')
ta = install.getElementsByTagNameNS('*', 'targetApplication')[0]

with open('schema/supported.json') as f:
  min_version = json.load(f)

for client, version in min_version.items():
  client = {'zotero': 'zotero@chnm.gmu.edu', 'jurism': 'juris-m@juris-m.github.io' }[client]
  _id = next(node for node in ta.getElementsByTagNameNS('*', 'id') if node.firstChild.nodeValue == client)
  for node in _id.parentNode.getElementsByTagNameNS('*', 'minVersion'):
    node.firstChild.replaceWholeText(version)
  print('minimum', client, 'version', version)

with open('build/install.rdf', 'w') as f:
  install.writexml(f)
