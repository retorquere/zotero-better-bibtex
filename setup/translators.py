#!/usr/bin/env python3

import glob
import json
import os

print('translators')
headers = []
pseudoOptions = ['exportDir', 'exportPath', 'custom', 'dropAttachments', 'cache']
displayOptions = { option: True for option in pseudoOptions }
for tr in sorted(glob.glob('translators/*.json')):
  with open(tr) as f:
    tr = json.load(f)
    print(' ', tr['label'])
    headers.append(tr)
    if 'displayOptions' in tr:
      displayOptions = displayOptions | tr['displayOptions']
displayOptions = sorted(list(displayOptions.keys()))
DisplayOptions = "{\n"
for option in displayOptions:
  if option in [ 'quickCopyMode', 'exportDir', 'exportPath' ]:
    DisplayOptions += f'  {option}?: string\n'
  else:
    DisplayOptions += f'  {option}?: boolean\n'
DisplayOptions += "}"
open('gen/translators.ts', 'w').write(f"""
/* eslint-disable @stylistic/quote-props, @stylistic/quotes, comma-dangle */
import type {{ Translators }} from '../typings/translators.d.ts'

export const displayOptions = {json.dumps(displayOptions, indent='  ')}
export const pseudoOptions = {json.dumps(pseudoOptions, indent='  ')}
// custom?: boolean is for pandoc-filter CSL
export type DisplayOptions = {DisplayOptions}
export const headers: Translators.Header[] = {json.dumps(headers, indent='  ')}
export const byId: Record<string, Translators.Header> = {{}}
export const byLabel: Record<string, Translators.Header> = {{}}
export const bySlug: Record<string, Translators.Header> = {{}}
for (const header of headers) {{
  byId[header.translatorID] = byLabel[header.label] = bySlug[header.label.replace(/ /g, '')] = header
}}
""".lstrip())
