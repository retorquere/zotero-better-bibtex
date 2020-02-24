#!/usr/bin/env python3

import markdown
import os
import lxml.html
import re
import csv
import json
import sqlite3
from munch import Munch

db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE abbrev (abbr, full, list)')

def munch_factory(cursor, row):
  m = Munch()
  for idx, col in enumerate(cursor.description):
    m[col[0]] = row[idx]
  return m
db.row_factory = munch_factory

print('generating (un)abbreviation lists')
root = os.path.join(os.path.dirname(__file__), '..')
journals = 'abbrv.jabref.org/journals'

def name(_csv):
  return _csv.replace('journal_abbreviations_', '').replace('.csv', '.json')

def match(abbr, full):
  #abbr = '^' + '.*'.join(re.escape(w) for w in re.split('[. ]+', abbr)) + '.*$'
  abbr = '.*'.join(re.escape(c) for c in list(re.sub('[-,. ()]', '', abbr)))
  if re.match(abbr, full, re.IGNORECASE) is None: return False
  return True

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
  with open(os.path.join(root, journals, a)) as f:
    reader = csv.reader(f, delimiter=';')
    for row in reader:
      full, abbr = row[0:2]
      if not match(abbr, full):
        #print(json.dumps(abbr), 'does not match', json.dumps(full))
        continue
      db.execute('INSERT INTO abbrev (abbr, full, list) VALUES (?, ?, ?)', (abbr, full, name(a)))

for row in db.execute('SELECT COUNT(*) as n FROM (SELECT abbr, COUNT(*) FROM abbrev GROUP BY abbr HAVING COUNT(*) > 1)'):
  print('Global dup:', row.n)
for row in db.execute('SELECT SUM(n) as n FROM (SELECT list, COUNT(*) as n FROM (SELECT abbr, list, COUNT(*) FROM abbrev GROUP BY abbr, list HAVING COUNT(*) > 1) GROUP BY list)'):
  print('per-list dup:', row.n)
