#!/usr/bin/env python3

import json
import glob
from munch import Munch
import os

def refresh(root):
  with open(os.path.join(root, 'util/bbt-json-schema.json')) as f:
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

  schema.properties['collections'] = Munch.fromDict({
    'type': 'object',
    'additionalProperties': {
      'type': 'object',
      'additionalProperties': False,
      'required': [ 'collections', 'key', 'name', 'items' ],
      'properties': {
        'collections': { 'type': 'array', 'items': { 'type': 'string' } },
        'key': { 'type': 'string' },
        'name': { 'type': 'string' },
        'items': { 'type': 'array', 'items': { 'type': 'string' } },
        'parent': { 'type': 'string' },
      },
    },
  })

  schema.properties['items'].properties = Munch.fromDict({
    k: v
    for k, v in schema.properties['items'].properties.items():
    if k in [ 'citationKey', 'itemID', 'key', 'dateAdded', 'dateModified', 'uri', 'creators', 'tags', 'notes', 'collections', 'relations', 'attachments' ]
  })

  itemTypes = set()
  creatorType = schema.properties['items']['items'].properties.creators['items'].properties.creatorType
  for client in glob.glob(os.path.join(root, 'schema/*.json')):
    with open(client) as f:
      client = Munch.fromDict(json.load(f))
      for itemType in client.itemTypes:
        itemTypes.add(itemType.itemType)
        for field in itemType.fields:
          schema.properties['items']['items'].properties[field.get('baseField', field.field)] = Munch(type='string')

        for creator in itemType.creatorTypes:
          creatorType.enum = sorted(list(set(creatorType.enum + [creator.creatorType])))

  schema.properties['items']['items'].properties.itemType = { 'enum': sorted(list(itemTypes)) }

  with open(os.path.join(root, 'bbt-json-schema.json'), 'w') as f:
    json.dump(schema, f, indent='  ')
