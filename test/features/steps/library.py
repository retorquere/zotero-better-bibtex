import json
from copy import deepcopy
from steps.utils import html2md, HashableDict, print
import steps.utils as utils

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
  if type(data) == list:
    data = [e for e in (strip_obj(de) for de in data) if e is not None]
    return data if len(data) > 0 else None

  elif type(data) == dict:
    data = {k: v for k, v in ((dk, strip_obj(dv)) for dk, dv in data.items()) if v is not None}
    return data if len(data) > 0 else None

  elif data in ['', u'']:
    return None

  else:
    return data

def clean_item(item):
  item = deepcopy(item)

  un_multi(item)

  item.pop('itemID', None)
  item.pop('version', None)
  item.pop('libraryID', None)
  item.pop('dateAdded', None)
  item.pop('dateModified', None)
  item.pop('uniqueFields', None)
  item.pop('key', None)
  item.pop('citekey', None)
  item.pop('collections', None)
  item.pop('__citekey__', None)
  item.pop('citationKey', None)
  item.pop('uri', None)

  item.pop('attachments', None) # I'll need to get around to this eventually

  # make diffs more readable
  if 'extra' in item:
    if type(item['extra']) == list:
      item['extra'] = [line.lower() for line in item['extra']]
    else:
      item['extra'] = item['extra'].lower().split('\n')

  if 'notes' in item:
    item['notes'] = sorted(strip_obj([html2md(unnest(note, 'note')) for note in item.get('notes', [])]))
    item['notes'] = [note.split('\n') for note in item['notes']]

  if 'note' in item:
    item['note']  = html2md(item['note']).split('\n')

  if 'tags' in item:
    item['tags'] = sorted(strip_obj([html2md(unnest(tag, 'tag')) for tag in item.get('tags', [])]))

  if 'creators' in item:
    item['creators'] = strip_obj(item['creators'])

  item = strip_obj(item)
  return item

def sort_collection(coll):
  coll['collections'] = sorted([sort_collection(c) for c in coll['collections']], key=lambda c: c.__hash__())
  coll['items'] = sorted(coll['items'], key=lambda i: i.__hash__())
  return coll

def load(lib):
  lib = HashableDict(lib)

  lib.pop('config', None)
  lib.pop('version', None)

  items = {
    item['itemID']: HashableDict(clean_item(item))
    for item in lib['items']
  }
  lib['items'] = sorted(items.values(), key=lambda item: item.get('title', '') + '::' + item.__hash__())
  for item in lib['items']:
    if 'relations' in item: utils.print(str(item['relations']))

  if 'collections' not in lib: lib['collections'] = {}
  collections = { k: HashableDict(v) for k, v in lib['collections'].items() }
  lib['collections'] = [ coll for coll in collections.values() if not 'parent' in coll or coll['parent'] == False ]

  for coll in list(collections.values()):
    coll.pop('parent', None)
    coll.pop('id', None)
    coll.pop('key', None)
    if 'collections' not in coll: coll['collections'] = []

  for coll in list(collections.values()):
    coll['items'] = sorted([ items[itemID].__hash__() for itemID in coll['items'] ])
    coll['collections'] = [ collections[key] for key in coll['collections'] ]

  lib['collections'] = sorted([sort_collection(c) for c in lib['collections']], key=lambda c: c.__hash__())

  return lib
