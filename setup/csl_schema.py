#!/usr/bin/env python3

import xml.etree.ElementTree as ET
import json
import rnc2rng

ns = {'rng': 'http://relaxng.org/ns/structure/1.0'}

with open('submodules/citation-style-language-schema/schemas/styles/csl-variables.rnc') as f:
  xml_string = rnc2rng.dumps(rnc2rng.loads(f.read()))
    
  root = ET.fromstring(xml_string)
    
  variables = {}
    
  for definition in root.findall('.//rng:define', ns):
    name_attr = definition.get('name', '')
        
    if name_attr.startswith('variables.'):
      group_name = name_attr.split('.')[1] # e.g., "numbers", "dates"
            
      values = definition.findall('.//rng:value', ns)
      variables[group_name] = [v.text for v in values if v.text]

with open('submodules/citation-style-language-schema/schemas/styles/csl-types.rnc') as f:
  xml_string = rnc2rng.dumps(rnc2rng.loads(f.read()))
  root = ET.fromstring(xml_string)
    
  item_types_definition = root.find(".//rng:define[@name='item-types']", ns)
  values = item_types_definition.findall('.//rng:value', ns)
  types = [v.text for v in values if v.text]

print('writing csl schema')
with open('gen/csl-schema.json', 'w') as f:
  json.dump({'variables': variables, 'types': types }, f, indent='  ')
