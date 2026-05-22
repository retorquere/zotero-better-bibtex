#!/usr/bin/env python3

from mako.template import Template
import glob, json
from collections import defaultdict

print('translators')

pseudoOptions = {
  'exportDir': '',
  'exportPath': '',
  'custom': False,
}
explain = {
  'custom': 'for pandoc-filter CSL',
  'displayOptions': 'for BetterBibTeX JSON'
}

optionFor = defaultdict(list)
displayOptions = {}

headers = []
for tr in sorted(glob.glob('translators/*.json')):
  with open(tr) as f:
    tr = json.load(f)
  headers.append(tr)
  if 'displayOptions' in tr:
    displayOptions = displayOptions | tr['displayOptions']
    for option in tr['displayOptions']:
      optionFor[option].append(tr['label'])

jsType = {
  str: 'string,',
  bool: 'boolean,',
}
def optionName(o):
  return o + '?:'

def makeOption(o, d):
  option = f'{optionName(o):25}{jsType[type(d)]:8}'
  comment = optionFor[o].copy()
  if o in explain:
    comment.append(explain[o])
  if len(comment) > 0:
    comment = ' // ' + ', '.join(comment)
  else:
    comment = ''
  return option + comment

with open('gen/translators.ts', 'w') as f:
  f.write(Template(filename='setup/templates/translators.ts.mako').render(**globals()))
