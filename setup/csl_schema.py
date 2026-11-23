#!/usr/bin/env python3

import json

import rnc2rng
import xmltodict


def ensure_list(value):
  if value is None:
    return []
  if isinstance(value, list):
    return value
  return [value]

def load_schema_definitions(path):
  xml_string = rnc2rng.dumps(rnc2rng.load(path))
  grammar = xmltodict.parse(xml_string)['grammar']

  definitions = {}
  for div in ensure_list(grammar.get('div')):
    for definition in ensure_list(div.get('define')):
      name = definition.get('@name')
      if name:
        definitions[name] = definition

  return definitions

def walk_values(node, definitions, seen=None):
  if seen is None:
    seen = set()

  if isinstance(node, list):
    values = []
    for item in node:
      values.extend(walk_values(item, definitions, seen))
    return values

  if not isinstance(node, dict):
    return []

  values = []

  for value in ensure_list(node.get('value')):
    if isinstance(value, str):
      values.append(value)

  for reference in ensure_list(node.get('ref')):
    name = reference.get('@name') if isinstance(reference, dict) else None
    if name and name not in seen and name in definitions:
      values.extend(walk_values(definitions[name], definitions, seen | {name}))

  for child_name, child in node.items():
    if child_name.startswith('@') or child_name in {'value', 'ref'}:
      continue
    values.extend(walk_values(child, definitions, seen))

  return values

definitions = load_schema_definitions('submodules/citation-style-language-schema/schemas/styles/csl.rnc')

variables = {}
for name, definition in definitions.items():
  if not name.startswith('variables.'):
    continue
  group = name.split('.', 1)[1]
  variables[group] = walk_values(definition, definitions)

types = walk_values(definitions['item-types'], definitions)

print('writing csl schema')
with open('gen/csl-schema.json', 'w') as f:
  json.dump({ 'variables': variables, 'types': types }, f, indent='  ')
