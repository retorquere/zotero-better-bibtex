#!/usr/bin/env python

import requests
import ruamel.yaml

yaml = ruamel.yaml.YAML()

versions = []
for channel in ['release', 'beta']:
  response = requests.get(f'https://www.zotero.org/download/client/version?channel={channel}')
  response.raise_for_status()
  versions.append(response.json()['linux-x86_64'])
versions = ' / '.join(versions)

with open('.github/ISSUE_TEMPLATE/bug_feature.yml', 'r') as file:
  template = yaml.load(file)

for step in template['body']:
  if step['type'] == 'input' and step['id'] == 'zotero':
    step['attributes']['description'] = f'MUST be {versions} or later'
    step['attributes']['placeholder'] = versions

with open('.github/ISSUE_TEMPLATE/bug_feature.yml', 'w') as file:
  yaml.dump(template, file)
