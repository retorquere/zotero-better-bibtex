/* eslint-disable no-magic-numbers, @typescript-eslint/quotes, max-len */
import { Events } from '../content/events'
<%
  import json
  prefix = 'translators.better-bibtex.'
%>
declare const Zotero: any
const prefix = '${prefix}'

import { Preferences, names, defaults } from './preferences/meta'
import { fromEntries } from '../content/object'

export const Preference = new class PreferenceManager {
  public default = defaults

  constructor() {
    this.baseAttachmentPath = Zotero.Prefs.get('baseAttachmentPath')
    Zotero.Prefs.registerObserver('baseAttachmentPath', val => { this.baseAttachmentPath = val })

    // migrate ancient keys
    let old, key
    if ((old = Zotero.Prefs.get(key = '${prefix}quickCopyMode')) === 'orgmode_citekey') {
      Zotero.Prefs.set(key, 'orgmode')
      Zotero.Prefs.set('${prefix}quickCopyOrgMode', 'citationkey')
    }
    if ((old = Zotero.Prefs.get(key = '${prefix}quickCopyMode')) === 'selectLink_citekey') {
      Zotero.Prefs.set(key, 'selectlink')
      Zotero.Prefs.set('${prefix}quickCopySelectLink', 'citationkey')
    }
    if ((old = Zotero.Prefs.get(key = '${prefix}quickCopyMode')) === 'selectLink') {
      Zotero.Prefs.set(key, 'selectlink')
    }
    if (typeof (old = Zotero.Prefs.get(key = '${prefix}workers')) === 'number') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('${prefix}workersMax', 1)
    }
    if (typeof (old = Zotero.Prefs.get(key = '${prefix}suppressTitleCase')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('${prefix}exportTitleCase', !old)
    }
    if (typeof (old = Zotero.Prefs.get(key = '${prefix}suppressBraceProtection')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('${prefix}exportBraceProtection', !old)
    }
    if (typeof (old = Zotero.Prefs.get(key = '${prefix}suppressSentenceCase')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('${prefix}importSentenceCase', old ? 'off' : 'on+guess')
    }
    if (typeof (old = Zotero.Prefs.get(key = '${prefix}suppressNoCase')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('${prefix}importCaseProtection', old ? 'off' : 'as-needed')
    }
    if (typeof (old = Zotero.Prefs.get(key = '${prefix}autoPin')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('${prefix}autoPinDelay', old ? 1 : 0)
    }
    if (Zotero.Prefs.get(key = '${prefix}autoExportDelay') === 1) {
      Zotero.Prefs.set(key, defaults.autoExportDelay)
    }

    function changed() { Events.emit('preference-changed', this) }
    // set defaults and install event emitter
    for (const pref of names) {
      if (pref !== 'platform') {
        if (typeof this[pref] === 'undefined') (this[pref] as any) = (typeof defaults[pref] === 'string' ? (defaults[pref] as string).replace(/^\u200B/, '') : defaults[pref])
        Zotero.Prefs.registerObserver(<%text>`${prefix}${pref}`</%text>, changed.bind(pref))
      }
    }
    // put this in a preference so that translators can access this.
    if (Zotero.isWin) {
      this.platform = 'win'
    }
    else if (Zotero.isMac) {
      this.platform = 'mac'
    }
    else {
      if (!Zotero.isLinux) Zotero.debug('error: better-bibtex could not establish the platform, assuming linux')
      this.platform = 'lin'
    }

    if (this.testing) {
      return new Proxy(this, {
        set: (object, property, value) => {
          if (!(property in object)) throw new TypeError(`Unsupported preference <%text>${new String(property)}</%text>`) // eslint-disable-line no-new-wrappers
          object[property] = value
          return true
        },
        get: (object, property) => {
          if (!(property in object)) throw new TypeError(`Unsupported preference <%text>${new String(property)}</%text>`) // eslint-disable-line no-new-wrappers
          return object[property] // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
      })
    }
  }

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
    return (Zotero.Prefs.get('translators.better-bibtex.${pref.name}') as ${pref.valid})
  }

% endfor
  get all(): Preferences {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return fromEntries(names.map(pref => [ pref, this[pref] ])) as Preferences
  }
}
