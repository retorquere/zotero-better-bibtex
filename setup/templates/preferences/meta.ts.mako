/* eslint-disable no-magic-numbers, @typescript-eslint/quotes, max-len, quote-props */
<% import json %>\
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

<% overrides = [pref for pref in preferences if pref.get('override', false)] %>\
<% cache_or_autoexport = [tr for tr in translators if tr.cached or tr.keepUpdated] %>\
<% ae_options = list(set([ option for tr in translators for option, dflt in tr.get('displayOptions', {}).items() if tr.keepUpdated and type(dflt) == bool and option not in ['exportFileData', 'keepUpdated'] ])) %>\
export const schema: {
  autoExport: { preferences: PreferenceName[], displayOptions: string[] }
  translator: Record<string, { cached: boolean, autoexport: boolean, displayOptions: string[], preferences: PreferenceName[], types: Record<string, { enum: string[] } | { type: 'boolean' }> }>
} = {
  autoExport: {
    preferences: ${json.dumps([ pref.var for pref in overrides ])},
    displayOptions: ${json.dumps(ae_options)},
  },
  translator: {
% for tr in cache_or_autoexport:
<%  options = [option for option in tr.get('displayOptions', {}).keys() if option in ae_options] %>\
    '${tr.label}': {
      autoexport: ${json.dumps(tr.keepUpdated)},
      cached: ${json.dumps(tr.cached)},
      preferences: ${json.dumps([pref.var for pref in overrides if pref.var in tr.affectedBy])},
      displayOptions: ${json.dumps(options)},
      types: {
%   for pref in overrides:
%     if pref.var in tr.affectedBy:
%       if 'options' in pref:
        ${pref.var}: { enum: ${json.dumps(list(pref.options.keys()))} },
%       else:
        ${pref.var}: { type: ${json.dumps(pref.type)} },
%       endif
%     endif
%   endfor
%   for option in options:
        ${option}: { type: 'boolean' },
%   endfor
      },
    },
% endfor
  },
}
