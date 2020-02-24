#!/usr/bin/env python3

import markdown
import os
import lxml.html
import re
import csv
import json
import sqlite3
from munch import Munch
import argparse

root = os.path.join(os.path.dirname(__file__), '..')

parser = argparse.ArgumentParser()
parser.add_argument('-c', '--case-sensitive', action='store_true')
parser.add_argument('-r', '--rebuild', action='store_true')
parser.add_argument('-v', '--verbose', action='store_true')
args = parser.parse_args()
if args.rebuild: args.verbose = True

if args.case_sensitive:
  dbname = 'abbrev-cs.sqlite'
else:
  dbname = 'abbrev-ci.sqlite'
if os.path.exists(dbname) and args.rebuild: os.remove(dbname)

rebuild = not os.path.exists(dbname)
db = sqlite3.connect(dbname)
def munch_factory(cursor, row):
  m = Munch()
  for idx, col in enumerate(cursor.description):
    m[col[0]] = row[idx]
  return m
db.row_factory = munch_factory

if rebuild:
  db.execute('CREATE TABLE abbrev (abbr, full, keep, list)')
  if args.verbose: print('generating (un)abbreviation lists')
  journals = 'abbrv.jabref.org/journals'

  def name(_csv):
    return _csv.replace('journal_abbreviations_', '').replace('.csv', '.json')

  def match(abbr, full):
    abbr = '.*'.join(re.escape(c) for c in list(re.sub('[-,. ()]', '', abbr)))
    if args.case_sensitive:
      if re.match(abbr, full) is None: return 0
    else:
      if re.match(abbr, full, re.IGNORECASE) is None: return 0
    return 1

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
    if args.verbose: print(' ', a)
    abbrev = {}
    with open(os.path.join(root, journals, a)) as f:
      reader = csv.reader(f, delimiter=';')
      for row in reader:
        full, abbr = row[0:2]
        abbr = abbr.replace(' & ', ' and ')
        full = full.replace(' & ', ' and ')
        keep = match(abbr, full)
        if not args.case_sensitive: abbr = abbr.lower()
        db.execute('INSERT INTO abbrev (abbr, full, keep, list) VALUES (?, ?, ?, ?)', (abbr, full, keep, name(a).replace('.json', '')))
  db.commit()

if args.verbose:
  if args.case_sensitive:
    print('## Case sensitive\n')
  else:
    print('## Case insensitive\n')

  for row in db.execute('SELECT COUNT(*) as n FROM abbrev WHERE keep = 0'):
    print(f'{row.n} abbrevs do not seem to match the full name\n')

  print('Combined lists:\n')
  for row in db.execute('SELECT COUNT(*) as n FROM (SELECT abbr, COUNT(*) FROM abbrev WHERE keep = 1 GROUP BY abbr HAVING COUNT(*) > 1)'):
    print(f'* {row.n} have more than one match')
  for row in db.execute('SELECT COUNT(*) as n FROM (SELECT abbr, COUNT(*) FROM abbrev WHERE keep = 1 GROUP BY abbr HAVING COUNT(*) = 1)'):
    print(f'* {row.n} unabbreviations available')

  print('\nSeperate lists:\n')
  for row in db.execute('SELECT SUM(n) as n FROM (SELECT list, COUNT(*) as n FROM (SELECT abbr, list, COUNT(*) FROM abbrev WHERE keep = 1 GROUP BY abbr, list HAVING COUNT(*) > 1) GROUP BY list)'):
    print(f'* {row.n} have more than one match')
  for row in db.execute('SELECT SUM(n) as n FROM (SELECT list, COUNT(*) as n FROM (SELECT abbr, list, COUNT(*) FROM abbrev WHERE keep = 1 GROUP BY abbr, list HAVING COUNT(*) = 1) GROUP BY list)'):
    print(f'* {row.n} unabbreviations available')

with open(os.path.join(root, 'build/resource/unabbrev.json'), 'w') as f:
  unabbrev = {}
  for row in db.execute('SELECT abbr, full FROM abbrev WHERE abbr IN (SELECT abbr FROM (SELECT DISTINCT abbr, full FROM abbrev WHERE keep = 1) GROUP BY abbr HAVING COUNT(*) = 1)'):
    unabbrev[row.abbr] = row.full
  json.dump(unabbrev, f, indent='  ')
