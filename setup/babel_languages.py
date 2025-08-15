#!/usr/bin/env python3

from pathlib import Path
from configparser import RawConfigParser
from collections import OrderedDict
import itertools
import json
from collections import defaultdict
import os

print('parsing babel language mapping')
import sqlite3
DB = sqlite3.connect(':memory:')

if os.path.exists('babel.sqlite'):
  os.remove('babel.sqlite')
#DB = sqlite3.connect('babel.sqlite', isolation_level=None)

class Row(sqlite3.Row):
  def __getattr__(self, name):
    return self[name]
  def __repr__(self):
    return str(tuple([self[k] for k in self.keys()]))
  def as_dict(self):
    return { k: self[k] for k in self.keys() }
DB.row_factory = Row

#class Trie:
#  def __init__(self):
#    self.letters={}
#
#  def addString(self,s):
#    letters=self.letters
#    for c in s:
#      if(c not in letters):
#        letters[c]={"freq":1}
#      else:
#        letters[c]["freq"]+=1
#      letters=letters[c]
#    letters["*"]=True #marks the end of word
#    
#  def generateUniquePrefix(self,s):
#    prefix=[]
#    letters=self.letters
#    for c in s:
#      prefix.append(c)
#      if(letters[c]["freq"]==1):
#        break
#      letters=letters[c]
#      
#    return "".join(prefix)
#
#  @classmethod
#  def prefix(cls, A):
#    t=Trie()
#    for s in A:
#      t.addString(s)
#    ans=[]
#    for s in A:
#      prefix=t.generateUniquePrefix(s)
#      ans.append(prefix)
#    return {k: next(v for v in A if v.startswith(k)) for k in ans}

DB.execute('CREATE TABLE biblatex (langid NOT NULL PRIMARY KEY)')
DB.executemany('INSERT INTO biblatex (langid) VALUES (?)', [(path.stem.lower(),) for path in Path('submodules/biblatex/tex/latex/biblatex/lbx').glob('*.lbx')])

class MultiOrderedDict(OrderedDict):
  def __setitem__(self, key, value):
    if isinstance(value, list) and key in self:
      self[key].extend(value)
    else:
      super().__setitem__(key, value)

DB.execute('CREATE TABLE babel (tag NOT NULL, prio NOT NULL, rel NOT NULL, langid NOT NULL)')
for path in sorted(Path('submodules/babel/locale').rglob('*.ini'), key=lambda p: p.name):
  with open(path) as f:
    if not '[identification]' in f.read():
      continue
  locale = RawConfigParser(dict_type=MultiOrderedDict, strict=False, allow_no_value=True)
  locale.read(str(path))
  locale = locale['identification']

  if 'name.babel' not in locale:
    print(' ', path.name, 'has no name')
    continue

  tag = locale['tag.bcp47'].lower()
  for prio, rel, name in zip([1] + [2] * len(locale['name.babel']), ['name'] + ['alias'] * len(locale['name.babel']), locale['name.babel'].split(' ')):
    DB.execute('INSERT INTO babel (tag, prio, rel, langid) VALUES (?, ?, ?, ?)', (tag, prio, rel, name.lower()))

  for key, name in locale.items():
    if key.startswith('name.babel.'):
      DB.execute('''
        INSERT INTO babel (tag, prio, rel, langid)
        SELECT :tag, :prio, :rel, :name
        WHERE NOT EXISTS(SELECT 1 FROM babel WHERE tag = :tag AND langid = :name)
      ''', { 'tag': tag, 'prio': 3, 'rel': 'alias', 'name': name.lower() })

  for rel in ['polyglossia', 'local', 'english']:
    key = 'name.' + rel
    if key in locale:
      DB.execute('''
        INSERT INTO babel (tag, prio, rel, langid)
        SELECT :tag, :prio, :rel, :langid
        WHERE NOT EXISTS(SELECT 1 FROM babel WHERE tag = :tag AND langid = :langid)
      ''', { 'tag': tag, 'prio': 4, 'rel': rel, 'langid': locale[key].lower() })

# cleanup
DB.execute('''
  DELETE FROM babel
  WHERE
    (tag LIKE 'de%-1901' AND langid LIKE 'n%')
    OR
    (tag LIKE 'de%-1996' AND langid NOT LIKE 'n%')
    OR
    (tag = 'es-mx' AND langid = 'spanish')
''')

# select name from biblatex-preferred, mark with 0 as selected
DB.execute('''
  WITH preferred AS (
    SELECT ROWID, tag, prio, langid, ROW_NUMBER () OVER (PARTITION BY tag ORDER BY prio, langid) as ranking
    FROM babel
    WHERE langid IN (SELECT langid FROM biblatex)
  )
  UPDATE babel
  SET prio = 0
  WHERE ROWID IN (SELECT ROWID FROM preferred WHERE ranking = 1)
''')

# mark babel name as selected for all others
DB.execute('''
  UPDATE babel
  SET prio = 0
  WHERE prio = 1 AND NOT EXISTS(SELECT 1 FROM babel sel WHERE sel.prio = 0 AND sel.tag = babel.tag)
''')

DB.execute('CREATE TABLE langmap (language NOT NULL PRIMARY KEY, langid NOT NULL)')

for row in list(DB.execute('SELECT tag, count(*) FROM babel WHERE prio = 0 GROUP BY tag HAVING COUNT(*) > 1')):
  if tuple(row) == ('ko', 2):
    print('fixing', row)
    # fix ko|0|name|korean-han as ko|0|name|korean also exists
    DB.execute("UPDATE babel SET rel='alias', prio=1 WHERE tag='ko' AND langid='korean-han'")
DB.execute('INSERT INTO langmap (language, langid) SELECT tag, langid FROM babel WHERE prio = 0')

# set self-alias
DB.execute('''
  INSERT INTO langmap (language, langid)
  SELECT DISTINCT langid, langid
  FROM langmap
  WHERE langid NOT IN (SELECT language FROM langmap)
''')

# 3-char abbreviation
DB.execute('''
  WITH abbr AS (
    SELECT DISTINCT REPLACE(SUBSTR(language, 1, 3), '-', '') AS language, langid
    FROM langmap
  ),
  abbr_groups AS (
    SELECT language, COUNT(*) AS n FROM abbr GROUP BY language
  )
  INSERT INTO langmap (language, langid)
  SELECT a.language, a.langid
  FROM abbr a
  JOIN abbr_groups g ON a.language = g.language
  WHERE LENGTH(a.language) = 3 AND g.n = 1 AND a.language NOT IN (SELECT language FROM langmap)
''')

# langids that map to a single tag (strict alias)
DB.execute('''
  WITH groupcount AS (
    SELECT langid, COUNT(*) AS groupcount
    FROM babel
    WHERE prio <> 0
    GROUP BY langid
  )
  INSERT INTO langmap (language, langid)
  SELECT alias.langid as tag, lang.langid as langid
  FROM groupcount
  JOIN babel alias ON alias.langid = groupcount.langid AND alias.prio <> 0
  JOIN babel lang ON lang.tag = alias.tag AND lang.prio = 0
  WHERE
    groupcount.groupcount = 1
    AND
    alias.langid NOT IN (SELECT language FROM langmap)
''')

# add tag-tag
DB.execute('''
  WITH tagtag AS (
    SELECT language || '-' || language as tag, langid
    FROM langmap
    WHERE language NOT LIKE '%-%' AND LENGTH(language) = 2
  )
  INSERT INTO langmap (language, langid)
  SELECT tag, langid
  FROM tagtag
  WHERE tag NOT IN (SELECT language FROM langmap)
''')

# language alias all with same prefix
langids = defaultdict(list)
for row in DB.execute('SELECT * FROM babel WHERE prio <> 0 AND langid NOT IN (SELECT language FROM langmap) ORDER BY langid'):
  langids[row.langid].append(row)
for langid, mapping in langids.items():
  prefix = os.path.commonprefix([lang.tag for lang in mapping])
  if len(prefix) > 0:
    if prefix[-1] == '-':
      prefix = prefix[:-1]
    DB.execute('INSERT INTO langmap (language, langid) SELECT ?, langid FROM langmap WHERE language = ?', (langid, prefix))

# manual patchups
patchups = {
  'gaelic': 'scottishgaelic',
  'norwegian': 'norsk',
  'tw': 'chinese-traditional',
  'zh-tw': 'chinese-traditional',
  'ara': 'arabic',
}
for language, langid in patchups.items():
  DB.execute('INSERT INTO langmap (language, langid) SELECT ?, ? WHERE EXISTS (SELECT 1 FROM langmap WHERE langid = ?)', (language, langid, langid))

# all unique prefixes
#for prefix, language in Trie.prefix([row.language for row in DB.execute('SELECT language FROM langmap')]).items():
#  continue # disable for now
#
#  if prefix[-1] == '-': prefix = prefix[:-1]
#  if len(prefix) < 3: continue # don't match very short IDs
#  DB.execute('''
#    INSERT INTO langmap (language, langid)
#    SELECT ?, langid
#    FROM langmap
#    WHERE language = ? AND NOT EXISTS (SELECT 1 FROM langmap WHERE language = ?)
#  ''', (prefix, language, prefix))

for row in DB.execute('SELECT * FROM babel WHERE prio <> 0 AND langid NOT IN (SELECT language FROM langmap) ORDER BY langid'):
  print(' ', row.langid, '=>', row.tag, 'not mapped')

os.makedirs('gen/babel', exist_ok=True)
with open('gen/babel/langmap.json', 'w') as f:
  json.dump({ row.language: row.langid for row in DB.execute('SELECT * from langmap ORDER BY language')}, f, indent='  ')

#with open('gen/babel/ids.json', 'w') as f:
#  json.dump([ row.langid for row in DB.execute('SELECT DISTINCT langid from langmap ORDER BY langid')], f, indent='  ')

with open('gen/babel/tag.json', 'w') as f:
  tag = {}
  q = '''
    WITH
      babeltag(tag) AS (
        SELECT 'en'
        UNION
        SELECT 'ja'
        UNION
        SELECT 'zh'
        UNION
        SELECT 'de'
        UNION
        SELECT 'ar'
      ),
      language(tag, language) AS (
        SELECT 'zh-hant', 'chinese-traditional'

        UNION

        SELECT 'zh-hant', 'zh-tw'

        UNION

        SELECT babeltag.tag, langmap.langid
        FROM langmap
        JOIN babeltag ON langmap.language = babeltag.tag OR (langmap.language NOT IN ('zh-hant', 'zh-tw') AND langmap.language LIKE babeltag.tag || '-%')

        UNION

        SELECT language.tag, langmap.language
        FROM language
        JOIN langmap ON langmap.langid = language.language
      )
    SELECT tag, language from language
  '''
  for row in DB.execute(q):
    tag[row.language] = row.tag
  json.dump(tag, f, indent='  ')

#for line in DB.iterdump():
#  print(line)

