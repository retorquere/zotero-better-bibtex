/* eslint-disable no-magic-numbers, @typescript-eslint/quotes, max-len, quote-props, comma-dangle */
<%
import json
import textwrap
%>\
## export type PreferenceName =
##   '${names[0]}'
## % for pref in names[1:]:
##   | '${pref}'
## % endfor

export const names = [
% for pref in names:
  '${pref}',
% endfor
] as const

export type PreferenceName = typeof names[number]

export const affects: Partial<Record<PreferenceName, string[]>> = {
% for pref in [p for p in preferences if len(p.affects) > 0]:
  ${pref.var}: ${json.dumps(pref.affects)},
% endfor
}

export type Preferences = {
% for pref in preferences:
  ${pref.var}: ${pref.valid | n }
% endfor
}

export const defaults: Preferences = {
% for pref in preferences:
  ${pref.var}: ${json.dumps(pref.default.replace('\u200b', '') if pref.var == 'citekeyFormat' else pref.default)},
% endfor
}

<% options = [pref for pref in preferences if 'options' in pref] %>\
export const options: Partial<Record<PreferenceName, Record<string, string>>> = {
% for pref in options:
  ${pref.var}: ${json.dumps(pref.options)},
% endfor
}

<%
ae_ignoreOptions = ['exportFileData', 'keepUpdated']
overrides = [pref for pref in preferences if pref.get('override', false)]
cache_or_autoexport = [tr for tr in translators if tr.cached or tr.keepUpdated]
ae_options = list(set([
  option
  for tr in translators
  for option, dflt in tr.get('displayOptions', {}).items()
  if tr.keepUpdated and type(dflt) == bool and option not in ae_ignoreOptions
]))
%>\
type LokiRecord = {
  type: 'object'
  additionalProperties: false
  properties: any
  required: string[]
}
export const schema: {
  autoExport: { preferences: PreferenceName[], displayOptions: string[] }
  translator: Record<string, { cache: false | LokiRecord, autoexport: false | LokiRecord, displayOptions: string[], preferences: PreferenceName[] }>
} = {
  autoExport: {
    preferences: ${json.dumps([ pref.var for pref in overrides ])},
    displayOptions: ${json.dumps(ae_options)},
  },
  translator: {
% for tr in cache_or_autoexport:
<%
tr_options = [option for option in tr.get('displayOptions', {}).keys() if option in ae_options]

tr_types = {}
for pref in overrides:
  if pref.var in tr.affectedBy and not pref.var in ae_ignoreOptions:
    if 'options' in pref:
      tr_types[pref.var] = { 'enum': list(pref.options.keys()) }
    else:
      tr_types[pref.var] = { 'type': pref.type }

tr_preferences = [pref.var for pref in overrides if pref.var in tr.affectedBy]

tr_ae = False
if tr.keepUpdated:
  tr_ae = {
    'type': 'object',
    'additionalProperties': False,
    'properties': {
      'type': { 'enum': [ 'collection', 'library' ] },
      'id': { 'type': 'integer' },
      'path': { 'type': 'string', 'minLength': 1 },
      'status': { 'enum': [ 'scheduled', 'running', 'done', 'error' ] },
      'translatorID': { 'const': tr.translatorID },

      'exportNotes': { 'type': 'boolean' },
      'useJournalAbbreviation': { 'type': 'boolean' },

      # prefs
      **tr_types,

      # status
      'error': { 'type': 'string' },
      'recursive': { 'type': 'boolean' },

      # LokiJS
      'meta': { 'type': 'object' },
      '$loki': { 'type': 'integer' },
    },
    'required': [ 'type', 'id', 'path', 'status', 'translatorID' ] + [ option for option in tr.displayOptions.keys() if option not in ae_ignoreOptions ] + tr_preferences
  }

tr_cache = False
if tr.cached:
  tr_cache = {
    'type': 'object',
    'properties': {
      'itemID': { 'type': 'integer' },
      'entry': { 'type': 'string' },

      # options
      'exportNotes': { 'type': 'boolean' },
      'useJournalAbbreviation': { 'type': 'boolean' },

      # prefs
      **tr_types,

      # Optional
      'metadata': { 'type': 'object' },

      # LokiJS
      'meta': { 'type': 'object' },
      '$loki': { 'type': 'integer' },
    },
    'required': [ 'itemID', 'exportNotes', 'useJournalAbbreviation' ] + tr_preferences + ['entry'],
    'additionalProperties': False,
  }

def indented(data, indent):
  return textwrap.indent(json.dumps(data, indent='  '), indent * '  ').strip()

%>\
    '${tr.label}': {
      autoexport: ${indented(tr_ae, 3)},
      cache: ${indented(tr_cache, 3)},
      preferences: ${json.dumps(tr_preferences)},
      displayOptions: ${json.dumps(tr_options)},
    },
% endfor
  },
}
