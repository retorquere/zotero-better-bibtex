#!/usr/bin/env python3

import glob
import json
import os

print('translators')
headers = []
for tr in sorted(glob.glob('translators/*.json')):
  with open(tr) as f:
    tr = json.load(f)
    print(' ', tr['label'])
    headers.append(tr)

open('gen/translators.ts', 'w').write(f"""
/* eslint-disable @typescript-eslint/quotes, quote-props, comma-dangle */
import type {{ Translators }} from '../typings/translators.d.ts'

export const headers: Translators.Header[] = {json.dumps(headers, indent='  ')}
export const byId: Record<string, Translators.Header> = {{}}
export const byName: Record<string, Translators.Header> = {{}}
export const byLabel: Record<string, Translators.Header> = {{}}
for (const header of headers) {{
  byId[header.translatorID] = byName[header.label] = byLabel[header.label.replace(/ /g, '')] = header
}}
""")
