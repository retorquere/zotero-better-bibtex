import json

with open('zotero.json') as f:
  schema = json.load(f)

itemTypes = {}

for itemType in schema['itemTypes']:
  for field in itemType['fields']:
    for fieldName in ['pages', 'volume', 'issue']:
      if field['field'] == fieldName or field.get('baseField') == fieldName:
        itemTypes[itemType['itemType']] = itemTypes.get(itemType['itemType'], {})
        itemTypes[itemType['itemType']][fieldName] = field['field']

for itemType, fields in itemTypes.items():
  print(itemType, len(fields), fields)
