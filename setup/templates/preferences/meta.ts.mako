/* eslint-disable no-magic-numbers, @typescript-eslint/quotes, max-len */
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

<% overrides = [pref for pref in preferences if pref.get('override', false)] %>\
<% cache_or_autoexport = [tr for tr in translators if tr.cached or tr.keepUpdated] %>\
export const schema: { autoExportPreferences: PreferenceName[], translator: Record<string, { cached: boolean, autoexport: boolean, preferences: PreferenceName[], types: Partial<Record<PreferenceName, { enum: string[] } | { type: 'boolean' }>> }> } = {
  autoExportPreferences: ${json.dumps([ pref.var for pref in overrides ])},
  translator: {
% for tr in cache_or_autoexport:
    '${tr.label}': {
      autoexport: ${json.dumps(tr.keepUpdated)},
      cached: ${json.dumps(tr.cached)},
      preferences: ${json.dumps([pref.var for pref in overrides if pref.var in tr.affectedBy])},
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
      },
    },
% endfor
  },
}
