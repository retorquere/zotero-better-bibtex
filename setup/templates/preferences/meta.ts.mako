/* eslint-disable no-magic-numbers, @typescript-eslint/quotes, max-len */
<% import json %>

export type PreferenceName =
  '${names[0]}'
% for pref in names[1:]:
  | '${pref}'
% endfor

export const names: PreferenceName[] = [
% for pref in names:
  '${pref}',
% endfor
]

export const affects: Record<PreferenceName, string[]> = {
% for pref in preferences:
  ${pref.var}: ${json.dumps(pref.affects)},
% endfor
}
export const affectedBy: Record<string, PreferenceName[]> = {
% for tr, prefs in affectedBy.items():
  '${tr}': [
%   for pref in prefs:
    '${pref}',
%   endfor
  ],
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

<% overrides = [pref for pref in preferences if pref.get('override', false)] %>
export const override: { names: PreferenceName[], types: Record<string, { enum: string[] } | { type: 'boolean' }> } = {
  names: [
% for pref in overrides:
    ${json.dumps(pref.var)},
% endfor
  ],
  types: {
% for pref in overrides:
%   if 'options' in pref:
    ${pref.var}: { enum: ${json.dumps(list(pref.options.keys()))} },
%   else:
    ${pref.var}: { type: ${json.dumps(pref.type)} },
%   endif
% endfor
  },
}
