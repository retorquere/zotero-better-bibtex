#!/usr/bin/env python3

import markdown
import os
import lxml.html
import re
import csv
import json

print('generating (un)abbreviation lists')
root = os.path.join(os.path.dirname(__file__), '..')
journals = 'abbrv.jabref.org/journals'

def name(_csv):
  return _csv.replace('journal_abbreviations_', '').replace('.csv', '.json')

abbrev_lists = {}
with open(os.path.join(root, journals, 'README.md')) as f:
  md = f.read()
  html = markdown.markdown(md)
  doc = lxml.html.fromstring(html)
for link in doc.xpath('//a'):
  href = link.get('href')
  if re.match(r'[-_a-z]+\.csv$', href):
    abbrev_lists[name(href)] = link.text
with open(os.path.join(root, 'build/resource/abbrev.json'), 'w') as f:
  json.dump(abbrev_lists, f, indent='  ')

for a in os.listdir(os.path.join(root, journals)):
  if not a.endswith('.csv'): continue
  print(' ', a)
  abbrev = {}
  unabbrev = {}
  with open(os.path.join(root, journals, a)) as f:
    reader = csv.reader(f, delimiter=';')
    for row in reader:
      unabbrev[row[1]] = row[0]
      abbrev[row[0]] = row[1]
  with open(os.path.join(root, 'build/resource/abbrev', name(a)), 'w') as f:
    json.dump(abbrev, f, indent='  ')
  with open(os.path.join(root, 'build/resource/unabbrev', name(a)), 'w') as f:
    json.dump(unabbrev, f, indent='  ')
