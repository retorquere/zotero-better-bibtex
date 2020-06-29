#!/usr/bin/env python3

import glob
import json
import xml.dom.minidom as minidom
import json

install = minidom.parse('build/install.rdf')
ta = install.getElementsByTagNameNS('*', 'targetApplication')[0]

for client in ['juris', 'zotero']:
  for schema in glob.glob(f'schema/{client}*.json'):
    with open(schema) as f:
      version = json.load(f)['release']
    _id = [node for node in ta.getElementsByTagNameNS('*', 'id') if client in node.firstChild.nodeValue][0]
    for node in _id.parentNode.getElementsByTagNameNS('*', 'minVersion'):
      node.firstChild.replaceWholeText(version)
    print('minimum', client, 'version', version)

with open('build/install.rdf', 'w') as f:
  install.writexml(f)
