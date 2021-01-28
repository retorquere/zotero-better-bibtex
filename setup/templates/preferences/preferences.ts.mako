/* eslint-disable no-magic-numbers, @typescript-eslint/quotes */
<%
  import json
%>
declare const Zotero: any

class PreferenceManager {
% for name, pref in preferences.items():
<%
    if 'options' in pref:
      valid = ' | '.join([ json.dumps(option) for option in pref.options ])
      options = json.dumps(list(pref.options.keys()))
    else:
      valid = pref.type
%>
  set ${name}(v: ${valid | n} | undefined) {
    if (typeof v === 'undefined') v = ${json.dumps(pref.default) | n}
    if (typeof v !== '${pref.type}') throw new Error(`${name} must be of type ${pref.type}, got '<%text>$</%text>{typeof v}'`)
%   if 'options' in pref:
    if (!${options | n}.includes(v)) throw new Error(`${name} must be one of ${options}, got '<%text>$</%text>{v}'`)
%     endif
    Zotero.Prefs.set('translators.better-bibtex.${name}', v)
  }
  get ${name}() {
    return Zotero.Prefs.get('translators.better-bibtex.${name}')
  }
% endfor

  public defaults() {
    return {
%   for name, pref in preferences.items():
      ${name}: ${json.dumps(pref.default) | n },
%   endfor
    }
  }

  public all() {
    return {
%   for name in preferences.keys():
      ${name}: this.${name},
%   endfor
    }
  }
}
