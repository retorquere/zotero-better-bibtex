/* eslint-disable no-magic-numbers, @typescript-eslint/quotes, max-len */
<%
  import json
%>
declare const Zotero: any

<%
  for name, pref in preferences.items():
    if 'options' in pref:
      pref.valid = ' | '.join([ json.dumps(option) for option in pref.options ])
      pref.quoted_options = json.dumps(list(pref.options.keys()))
    else:
      pref.valid = pref.type
%>

type Preferences = {
% for name, pref in preferences.items():
  ${name}: ${pref.valid | n }
% endfor
}

export class PreferenceManager {
% for name, pref in preferences.items():
  set ${name}(v: ${pref.valid | n} | undefined) {
    if (typeof v === 'undefined') v = ${json.dumps(pref.default) | n}
    if (typeof v !== '${pref.type}') throw new Error(`${name} must be of type ${pref.type}, got '<%text>$</%text>{typeof v}'`)
%   if 'quoted_options' in pref:
    if (!${pref.quoted_options | n}.includes(v)) throw new Error(`${name} must be one of ${pref.quoted_options}, got '<%text>$</%text>{v}'`)
%     endif
    Zotero.Prefs.set('translators.better-bibtex.${name}', v)
  }
  get ${name}(): ${pref.valid} {
    return (Zotero.Prefs.get('translators.better-bibtex.${name}') as ${pref.valid})
  }
% endfor

  public defaults(): Preferences {
    return {
%   for name, pref in preferences.items():
      ${name}: ${json.dumps(pref.default) | n },
%   endfor
    }
  }

  public all(): Preferences {
    return {
%   for name in preferences.keys():
      ${name}: this.${name},
%   endfor
    }
  }
}
