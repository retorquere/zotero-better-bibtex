#!/usr/bin/env python3

import glob
import json
import os

print('translators')
headers = []

pseudoOptions = {
  'exportDir': '',
  'exportPath': '',
  'custom': False,
  'dropAttachments': False,
  'cache': True,
  # 'displayOptions': '',
}
explain = {
  'custom': 'for pandoc-filter CSL',
  'displayOptions': 'for BetterBibTeX JSON'
}

displayOptions = pseudoOptions.copy()

for tr in sorted(glob.glob('translators/*.json')):
  with open(tr) as f:
    tr = json.load(f)
    print(' ', tr['label'])
    headers.append(tr)
    if 'displayOptions' in tr:
      displayOptions = displayOptions | tr['displayOptions']

DisplayOptions = "{\n"
for option, default in sorted(displayOptions.items()):
  explanation = f' // {explain[option]}' if option in explain else ''
  DisplayOptions += f'  {option}?: { { str: "string", bool: "boolean" }[type(default)] }{explanation}\n'
DisplayOptions += "}"

open('gen/translators.ts', 'w').write(f"""
/* eslint-disable @stylistic/quote-props, @stylistic/quotes, comma-dangle */
import type {{ Translators }} from '../typings/translators.d.ts'

export const displayOptions = {json.dumps(sorted(displayOptions.keys()), indent='  ')}

export const pseudoOptions = {json.dumps(sorted(pseudoOptions), indent='  ')}

export type DisplayOptions = {DisplayOptions}

export const headers: Translators.Header[] = {json.dumps(headers, indent='  ')}
export const byId: Record<string, Translators.Header> = {{}}
export const byLabel: Record<string, Translators.Header> = {{}}
export const bySlug: Record<string, Translators.Header> = {{}}
for (const header of headers) {{
  byId[header.translatorID] = byLabel[header.label] = bySlug[header.label.replace(/ /g, '')] = header
}}
""".lstrip())
