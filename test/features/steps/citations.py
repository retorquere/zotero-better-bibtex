#!/usr/bin/env python3

import json, sys, zipfile, io, re, html
import xml.etree.ElementTree as ET

def neuter(cit):
  for key in ['id', 'citationID', 'uri', 'uris', 'properties']:
    if key in cit:
      del cit[key]
  for k, v in list(cit.items()):
    if v == '':
      del cit[k]
  if 'citationItems' in cit:
    for c in cit['citationItems']:
      neuter(c)
  return cit

def citations(fname):
  with zipfile.ZipFile(fname) as zf:
    with io.TextIOWrapper(zf.open('content.xml'), encoding='utf-8') as f:
      doc = f.read()

      cit = []
      start = '{urn:oasis:names:tc:opendocument:xmlns:text:1.0}reference-mark-start'
      name = '{urn:oasis:names:tc:opendocument:xmlns:text:1.0}name'
      tree = ET.fromstring(doc)
      for child in tree.iter():  
        if child.tag == start and (c := child.attrib.get(name)):
          c = c.split(' ', 2)[2]
          c = c.rsplit(' ', 1)[0]
          c = json.loads(c)
          c = neuter(c)
          cit.append(c)

      return json.dumps(cit, indent='  ', sort_keys=True)

if __name__ == "__main__":
  assert len(sys.argv) == 2, sys.argv
  print(citations(sys.argv[1]))
