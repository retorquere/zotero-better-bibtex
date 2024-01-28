import re
import json
from copy import deepcopy
from steps.utils import html2md, HashableDict, print
import steps.utils as utils
import sqlite3

def unnest(obj, key):
  if type(obj) == str: return obj
  return obj[key]
  
def un_multi(obj):
  if type(obj) == dict:
    obj.pop('multi', None)
    for v in obj.values():
      un_multi(v)
  elif type(obj) == list:
    for v in obj:
      un_multi(v)

def strip_obj(data):
  if isinstance(data, list):
    data = [strip_obj(d) for d in data]
    data = [d for d in data if d is not None]
    if len(data) == 0: data = None

  elif isinstance(data, dict):
    data = { k: strip_obj(v) for k, v in data.items() }
    data = { k: v for k, v in data.items() if v is not None }
    if len(data) == 0: data = None

  return None if data in ['', u'', {}, [], None] else data

def unnest_and_clean(item, field):
  inner = field
  field += 's'
  if field not in item:
    return False

  item[field] = [unnest(note, inner) for note in item[field]]
  item[field] = [html2md(note) for note in item[field]]
  item[field] = strip_obj(item[field])
  if item[field] is None:
    del item[field]
    return False
  else:
    item[field] = [note for note in item[field] if note]
    item[field] = sorted(item[field])
  return True

def clean_item(item):
  item = deepcopy(item)

  un_multi(item)

  item.pop('__citekey__', None)
  item.pop('autoJournalAbbreviation', None)
  item.pop('citationKey', None)
  item.pop('citekey', None)
  item.pop('collections', None)
  item.pop('dateAdded', None)
  item.pop('dateModified', None)
  #item.pop('itemID', None)
  #item.pop('itemKey', None)
  item.pop('key', None)
  item.pop('libraryID', None)
  item.pop('uniqueFields', None)
  item.pop('uri', None)
  item.pop('version', None)
  item.pop('libraryID', None)

  if 'attachments' in item:
    for att in item['attachments']:
      if 'path' in att:
        att['path'] = re.sub(r'.*/zotero/storage/[^/]+', 'ATTACHMENT_KEY', att['path'])
      att.pop('uri', None)
      att.pop('accessDate', None)
      att.pop('itemKey', None)
      att.pop('key', None)
      att.pop('libraryID', None)
      att.pop('dateAdded', None)
      att.pop('dateModified', None)
      att.pop('parentItem', None)
      att.pop('version', None)

  # make diffs more readable
  if 'extra' in item and type(item['extra']) != list:
      item['extra'] = item['extra'].split('\n')

  if unnest_and_clean(item, 'note'):
    item['notes'] = [note.split('\n') for note in item['notes']]

  if 'note' in item:
    item['note']  = html2md(item['note']).split('\n')

  unnest_and_clean(item, 'tag')

  item = strip_obj(item)

  return item

def unkey(data):
  if isinstance(data, list):
    return [unkey(d) for d in data]

  elif isinstance(data, dict):
    return { k: unkey(v) for k, v in data.items() if k not in ('itemID', 'itemKey', 'key') }

  else:
    return data

def ascii(s):
  return re.sub(r'[^\x20-\x7f]',r'', s)

def load(lib):
  lib.pop('config', None)
  lib.pop('version', None)

  for item in lib['items']:
    if 'relations' in item:
      if len(item['relations']) == 0:
        del item['relations']
      else:
        utils.print('relations:' + str(item['relations']))

  lib['items'] = [clean_item(item) for item in lib['items']]
  lib['items'] = sorted(lib['items'], key=lambda i: ascii(json.dumps(unkey(i), sort_keys=True)))

  # renumber items
  itemIDs = {}
  for item in lib['items']:
    itemID = itemIDs[item['itemID']] = len(itemIDs)
    item['itemID'] = itemID
    item['itemKey'] = str(itemID).rjust(10, '0')
    if 'attachments' in item:
      for att in item['attachments']:
        att.pop('itemID', None)
        att.pop('itemKey', None)

  if 'collections' not in lib: lib['collections'] = {}

  db = sqlite3.connect(':memory:')
  db.execute('CREATE TABLE collections (id, name, parent)')
  for coll in lib['collections'].values():
    db.execute('INSERT INTO collections (id, name) VALUES (?, ?)', (coll['key'], coll['name']))
    coll.pop('parent', None)
    coll.pop('id', None)
  for coll in lib['collections'].values():
    for sub in coll.get('collections', []):
      db.execute('UPDATE collections SET parent = ? WHERE id = ?', (coll['key'], sub))
  def collectionName(key):
    q = '''
      WITH RECURSIVE path(level, name, parent) AS (
        SELECT 0, name, parent FROM collections WHERE id = ?

        UNION ALL

        SELECT path.level + 1, collections.name, collections.parent FROM collections JOIN path ON collections.id = path.parent
      )
      ,path_from_root AS (
        SELECT name FROM path ORDER BY level DESC
      )
      SELECT group_concat(name, ' :: ') FROM path_from_root;
    '''
    for row in db.execute(q, (key,)):
      return row[0]

  # renumber collections
  collectionKeys = {}
  for coll in sorted(lib['collections'].values(), key=lambda c: collectionName(c['key'])):
    collKey = collectionKeys[coll['key']] = str(len(collectionKeys)).rjust(10, '0')
    coll['key'] = collKey
  for coll in list(lib['collections'].values()):
    if 'items' not in coll: coll['items'] = []
    coll['items'] = sorted([itemIDs[i] for i in coll['items']])

    if 'collections' not in coll: coll['collections'] = []
    coll['collections'] = sorted([collectionKeys[k] for k in coll['collections']])

  lib['collections'] = {
    coll['key']: coll
    for coll in sorted(lib['collections'].values(), key=lambda c: json.dumps(unkey(c), sort_keys=True))
  }

  return lib
