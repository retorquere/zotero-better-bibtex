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
import inflect
from pygtrie import CharTrie as Trie

root = os.path.join(os.path.dirname(__file__), '..')

parser = argparse.ArgumentParser()
parser.add_argument('-c', '--case-sensitive', action='store_true')
parser.add_argument('-r', '--rebuild', action='store_true')
args = parser.parse_args()

if args.case_sensitive:
  dbname = 'abbrev-cs.sqlite'
else:
  dbname = 'abbrev-ci.sqlite'
dbname = ':memory:'
if os.path.exists(dbname) and (args.rebuild or os.stat(dbname).st_mtime < os.stat(__file__).st_mtime): os.remove(dbname)

rebuild = not os.path.exists(dbname)
db = sqlite3.connect(dbname)
def munch_factory(cursor, row):
  m = Munch()
  for idx, col in enumerate(cursor.description):
    m[col[0]] = row[idx]
  return m
db.row_factory = munch_factory

number = inflect.engine()
def _mismatch(abbr, full):
  abbr = '.*?' + '.*?'.join(re.escape(c) for c in list(re.sub('[-&,. ()]', '', abbr)))
  if args.case_sensitive:
    if re.match(abbr, full) is None: return 'mismatch'
  else:
    if re.match(abbr, full, re.IGNORECASE) is None: return 'mismatch'
  return None
def mismatch(abbr, full):
  m = _mismatch(abbr, full)
  if m is None: return m

  m = _mismatch(re.sub('[0-9]+', lambda n: number.number_to_words(int(n.group())).replace('-', ''), abbr), full)
  if m is None: return m

  return _mismatch(re.sub('[0-9]+', lambda n: number.ordinal(int(n.group())).replace('-', ''), abbr), full)

def unjunk(abbr, full): # holy crap what a mess these lists are
  if abbr[-1] == '.': abbr = abbr[:-1]
  if abbr.endswith(' j'):
    prefix = abbr + 'ournal-'
    if full.lower().startswith(prefix):
      full = full[len(prefix):]
      full = full[0].upper() + full[1:]

    prefix = abbr + 'etin-'
    if full.lower().startswith(prefix):
      full = full[len(prefix):]
      full = full[0].upper() + full[1:]
  return full

if rebuild:
  db.execute('CREATE TABLE abbrev (abbr, full, discard, list)')
  db.execute('CREATE TABLE clean (abbr, full)')

  print('generating (un)abbreviation lists')
  journals = 'abbrv.jabref.org/journals'

  def name(_csv, ext = '.json'):
    return _csv.replace('journal_abbreviations_', '').replace('.csv', ext)

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

  for abbrev_csv in os.listdir(os.path.join(root, journals)):
    if not abbrev_csv.endswith('.csv'): continue

    print('  *', abbrev_csv)
    with open(os.path.join(root, journals, abbrev_csv)) as f:
      reader = csv.reader(f, delimiter=';')
      for row in reader:
        full, abbr = [r.strip() for r in row[0:2]]
        if full == '' or abbr == '': continue

        abbr = re.sub('[{}$]', '', abbr)
        full = re.sub('[{}$]', '', full)
        if not args.case_sensitive: abbr = abbr.lower()
        db.execute('INSERT INTO abbrev (abbr, full, discard, list) VALUES (?, ?, ?, ?)', (abbr, unjunk(abbr, full), mismatch(abbr, full), name(abbrev_csv, '')))

  print('  removing abbr == full')
  db.execute("UPDATE abbrev SET discard = 'same' WHERE LOWER(abbr) = LOWER(full)")
  db.execute("UPDATE abbrev SET discard = 'same' WHERE LOWER(abbr) IN (SELECT LOWER(full) FROM abbrev WHERE discard IS NULL)")

  #print('  removing & alternates')
  #db.execute('''
    #WITH amp_and AS (SELECT REPLACE(full, ' and ', ' & ') as full FROM abbrev WHERE full LIKE '% and %')
    #UPDATE abbrev SET discard = 'alternate'
    #WHERE discard IS NULL AND full LIKE '% & %' AND full IN (SELECT full FROM amp_and)
  #''')

  print('  removing prefix alternates and duplicates')
  trie = Trie()
  prefixed = set([])
  multiple = set([])
  duplicate = []
  for row in db.execute('SELECT rowid, abbr, full FROM abbrev WHERE discard IS NULL GROUP BY abbr, full ORDER BY abbr, full DESC'):
    name = f'{row.abbr}\t{row.full.lower()}'
    if trie.get(name): # strict duplicates
      duplicate.append(str(row.rowid))
      continue
    if trie.get(name): # strict duplicates
      duplicate.append(str(row.rowid))
      continue

    try: # "aana j.": "AANA Journal" with better alternatives
      longer = None
      for mapping, rowid in trie.items(prefix=f'{row.abbr}\t'): # abbr already in there => longer because of full DESC
        longer = mapping
        break
      if longer is not None:
        abbr = row.abbr
        if abbr.endswith('.'): abbr = abbr[:-1]
        if abbr.endswith(' j') and row.full.lower() == abbr + 'ournal':
          prefixed.add(str(row.rowid))
          continue
        if abbr.endswith(' bull') and row.full.lower() == abbr + 'etin':
          prefixed.add(str(row.rowid))
          continue

        # when two journal names exist for the same abbr, keep the longer
        multiple.add(str(row.rowid))
        continue
    except:
      pass

    try:
      for prefix, rowid in trie.items(prefix=name):
        prefixed.add(str(rowid))
    except KeyError: # prefix doesn't exist
      pass 
    trie[name] = row.rowid
  if len(duplicate) > 0: db.execute("DELETE FROM abbrev WHERE rowid IN (" + ', '.join(list(duplicate)) + ')')
  if len(prefixed) > 0: db.execute("UPDATE abbrev SET discard='prefix' WHERE rowid IN (" + ', '.join(list(prefixed)) + ')')
  if len(multiple) > 0: db.execute("UPDATE abbrev SET discard='multiple' WHERE rowid IN (" + ', '.join(list(multiple)) + ')')
    
#  print('  removing duplicates')
#  db.execute('''
#    WITH
#    distinct_abbr_full AS (SELECT DISTINCT abbr, full FROM abbrev WHERE discard IS NULL),
#    abbr_count AS (SELECT abbr, COUNT(*), MIN(rowid) AS n FROM distinct_abbr_full GROUP BY abbr)
#
#    UPDATE abbrev SET discard = 'duplicate' WHERE abbr IN (SELECT abbr FROM abbr_count WHERE n > 1)
#  ''')

  db.commit()

with open(os.path.join(root, 'build/resource/unabbrev.json'), 'w') as f:
  unabbrev = {}
  for row in db.execute('SELECT DISTINCT abbr, full FROM abbrev WHERE discard IS NULL'):
    unabbrev[row.abbr] = row.full
  json.dump(unabbrev, f, indent='  ')

for row in db.execute('SELECT COUNT(*) AS n FROM abbrev WHERE discard IS NULL'):
  print('  abbreviations:', row.n)

for row in db.execute('SELECT discard, COUNT(*) AS n FROM abbrev WHERE discard IS NOT NULL GROUP BY discard'):
  print(f'  {row.discard}: {row.n}')

with open('discarded.csv', 'w') as f:
  writer = csv.writer(f, delimiter=';')
  writer.writerow(['abbr', 'full', 'reason'])
  for row in db.execute('SELECT abbr, full, discard AS reason FROM abbrev WHERE discard IS NOT NULL ORDER BY abbr, full'):
    writer.writerow([row.abbr, row.full, row.reason])
