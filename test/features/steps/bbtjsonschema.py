#!/usr/bin/env python3

import json
import glob
from munch import Munch
import os
import jsonschema

root = os.path.join(os.path.dirname(__file__), '../../..')

baseline = __file__.replace('.py', '.json')
def refresh():
  with open(baseline) as f:
    schema = Munch.fromDict(json.load(f))
  with open(os.path.join(root, 'gen/preferences/preferences.json')) as f:
    prefs = Munch.fromDict(json.load(f))

  schema.properties.config.properties.preferences.properties = {}
  for pref, meta in prefs.items():
    if meta.type == 'string' and 'options' in meta:
      schema.properties.config.properties.preferences.properties[pref] = { 'enum': list(meta.options.keys()) }
    elif meta.type in [ 'string', 'boolean', 'number' ]:
      schema.properties.config.properties.preferences.properties[pref] = { 'type': meta.type }
    else:
      raise ValueError(meta.type)

  schema.properties['items'].properties = Munch.fromDict({
    k: v
    for k, v in schema.properties['items']['items'].properties.items()
    if k in [ 'note', 'multi', 'citationKey', 'itemID', 'key', 'dateAdded', 'dateModified', 'uri', 'creators', 'tags', 'notes', 'collections', 'relations', 'attachments' ]
  })

  itemTypes = set()
  creatorType = schema.properties['items']['items'].properties.creators['items'].properties.creatorType
  for client in glob.glob(os.path.join(root, 'schema/*.json')):
    with open(client) as f:
      client = Munch.fromDict(json.load(f))
      for itemType in client.itemTypes:
        itemTypes.add(itemType.itemType)
        for field in itemType.fields:
          if field.field == 'extra':
            fieldType = Munch.fromDict({'type' : 'array', 'items': { 'type': 'string' } })
          else:
            fieldType = Munch(type='string')
          schema.properties['items']['items'].properties[field.get('baseField', field.field)] = fieldType

        for creator in itemType.creatorTypes:
          creatorType.enum = sorted(list(set(creatorType.enum + [creator.creatorType])))

  schema.properties['items']['items'].properties.itemType = { 'enum': sorted(list(itemTypes)) }

  with open(baseline, 'w') as f:
    json.dump(schema, f, indent='  ')
  return schema
schema = refresh()

def validate(lib):
  with open(baseline) as f:
    jsonschema.validate(instance=lib, schema=schema)
