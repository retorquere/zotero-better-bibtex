#!/usr/bin/env python3

import json
import os

translator = 'Better BibLaTeX'
data = "./test/fixtures/export/Really Big whopping library.json"

with open('tr.js', 'w') as tr:
  print(f'''
    const fs = require('fs')

    const self = {{ eval }}

    self.location = {{ search: "?client=zotero&version=5.0.80&platform=mac&translator={translator.replace(' ', '%20')}" }}
  ''', file = tr)

  with open('build/resource/worker/Zotero.js') as zotero:
    for line in zotero:
      if line.startswith('ctx.importScripts'): continue
      print(line, file=tr)

  with open(f'build/resource/{translator}.js') as f:
    print(f.read(), file=tr)

  print(f'''
    const data = require({json.dumps(data)})
    const preferences = require('./gen/preferences/defaults.json')

    self.postMessage = function(msg) {{
      switch (msg.kind) {{
        case 'debug':
          console.log(msg.message)
          break
        case 'error':
          console.log(msg.message)
          console.log(msg.stack)
          break
        case 'export':
          console.log(msg.output)
          break
        default:
          console.log(msg)
      }}
    }}

    onmessage({{
      data: {{
        preferences: Object.assign(preferences, data.config.preferences),
        options: data.config.options,
        items: data.items,
      }}
    }})
  ''', file=tr)

os.system('node tr.js')
