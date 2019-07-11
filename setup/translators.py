#!/usr/bin/env python3

import json
import os
import glob
from addict import Dict
import datetime
import re
from Cheetah.Template import Template

print('translators')

root = os.path.join(os.path.dirname(__file__), '..')

lastUpdated = datetime.datetime.now().isoformat().replace('T', ' ').split('.')[0]

translators = Dict()
variables = Dict()

def jstype(v):
  if type(v) == bool: return 'boolean'
  if type(v) == str: return 'string'
  if type(v) == int: return 'number'
  raise ValueError(f'Unexpected type {type(v)}')

for header in sorted(glob.glob(os.path.join(root, 'translators/*.json'))):
  with open(header) as f:
    header = Dict(json.load(f))
    print(f'  {header.label}')
    header.lastUpdated = lastUpdated

    translators.byId[header.translatorID] = header
    translators.byName[header.label] = header
    translators.byLabel[re.sub(r'[^a-zA-Z]', '', header.label)] = header

    for key, value in header.items():
      if key == 'displayOptions':
        for option, default in value.items():
          variables.displayOptions[option] = jstype(default)

      elif key == 'configOptions':
        for option, default in value.items():
          variables.configOptions[option] = jstype(default)

      else:
        variables.header[key] = jstype(value)

with open(os.path.join(root, 'gen/translators.json'), 'w') as out:
  json.dump(translators, out, indent=2, sort_keys=True)

with open(os.path.join(root, 'gen/preferences/defaults.json')) as f:
  variables.preferences = json.load(f)

  for pref, default in variables.preferences.items():
    variables.preferences[pref] = jstype(default)

variables.labels = translators.byLabel.keys()

template = """
interface ITranslator {
  preferences: {
    testing: bool
  #for $pref, $type in $preferences.items()
    $pref: $type
  #end for
  }
  skipFields: string[]
  skipField: {[key: string]: boolean}
  csquotes: { open: string, close: string }

  options: {
    quickCopyMode?: string
    dropAttachments?: boolean
    exportPath?: string
    #for $key, $type in $displayOptions.items():
    $key?: $type
    #end for
  }

  #for $label in $labels
  $label?: boolean
  #end for
  TeX: boolean
  CSL: boolean

  caching: boolean

  header: {
  #for $key, $type in $header.items():
    $key: $type
  #end for

    displayOptions: {
    #for $key, $type in $displayOptions.items():
      $key: $type
    #end for
    }

    configOptions: {
    #for $key, $type in $configOptions.items():
      $key: $type
    #end for
    }
  }

  collections: any[]
  references: Array<{citekey: string, reference: string}>

  isJurisM: boolean
  isZotero: boolean
  unicode: boolean
  platform: string
  paths: {
    caseSensitive: boolean
    sep: string
  }
  debugEnabled: boolean
  BetterBibTeX: boolean
  BetterBibLaTeX: boolean
  BetterTeX: boolean

  doExport: () => void
  detectImport: () => void
  doImport: () => void
  initialize: () => void
  stringCompare: (a: string, b: string) => number
}
"""

with open(os.path.join(root, 'gen/typings/translator.d.ts'), 'w') as out:
  out.write(str(Template(template, searchList=[variables.to_dict()])))
