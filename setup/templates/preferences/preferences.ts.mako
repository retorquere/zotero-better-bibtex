/* eslint-disable no-magic-numbers, @typescript-eslint/quotes, max-len */

<%
  import json
  prefix = 'translators.better-bibtex.'
%>
declare const Zotero: any

import { Preferences, names, defaults } from './preferences/meta'
import { fromEntries } from '../content/object'

export class PreferenceManager {
  public default = defaults
  public prefix = '${prefix}'

% for pref in preferences:
%   if pref.name != 'platform':
  set ${pref.var}(v: ${pref.valid | n} | undefined) {
    if (typeof v === 'undefined') v = ${json.dumps(pref.default) | n}
    if (v === this.${pref.var}) return
%   else:
  set ${pref.var}(v: ${pref.valid | n}) {
%   endif
%   if 'quoted_options' in pref:
    if (!${pref.quoted_options | n}.includes(v)) throw new Error(`${pref.var} must be one of ${pref.quoted_options}, got '<%text>$</%text>{v}'`)
%   else:
    if (typeof v !== '${pref.type}') throw new Error(`${pref.var} must be of type ${pref.type}, got '<%text>$</%text>{typeof v}'`)
%   endif
    Zotero.Prefs.set('translators.better-bibtex.${pref.name}', v)
  }
  get ${pref.var}(): ${pref.valid} {
    const v: ${pref.valid} = Zotero.Prefs.get('translators.better-bibtex.${pref.name}') as ${pref.valid}
    return typeof v === 'undefined' ? ${json.dumps(pref.default) | n} : v
  }

% endfor
  get all(): Preferences {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return fromEntries(names.map(pref => [ pref, this[pref] ])) as Preferences
  }
}
