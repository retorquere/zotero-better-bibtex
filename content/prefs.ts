/* eslint-disable no-magic-numbers, @typescript-eslint/quotes, max-len */
declare const Services: any

import { Events } from './events'

declare const Zotero: any

import { names, defaults } from '../gen/preferences/meta'
import { PreferenceManager as PreferenceManagerBase } from '../gen/preferences'

export const Preference = new class PreferenceManager extends PreferenceManagerBase {
  public prefix = 'translators.better-bibtex.'

  constructor() {
    super()

    this.baseAttachmentPath = Zotero.Prefs.get('baseAttachmentPath')
    Zotero.Prefs.registerObserver('baseAttachmentPath', val => { this.baseAttachmentPath = val })

    this.migrate()

    // set defaults and install event emitter
    for (const pref of names) {
      if (pref !== 'platform') {
        if (typeof this[pref] === 'undefined') (this[pref] as any) = (typeof defaults[pref] === 'string' ? (defaults[pref] as string).replace(/^\u200B/, '') : defaults[pref])
        this.register(pref)
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

  register(pref: string) {
    Zotero.Prefs.registerObserver(`${this.prefix}${pref}`, this.changed.bind(this, pref))
  }

  changed(pref: string) {
    Events.emit('preference-changed', pref)
  }

  private migrate() {
    let old, key

    // clear out old keys
    const oops = 'extensions.translators.better-bibtex.'
    for (key of Services.prefs.getBranch(oops).getChildList('', {}) as string[]) {
      Zotero.Prefs.clear(oops + key, true) // eslint-disable-line @typescript-eslint/restrict-plus-operands
    }
    if (typeof Zotero.Prefs.get(key = 'translators.better-bibtex.citeprocNoteCitekey') !== 'undefined') Zotero.Prefs.clear(key)
    if (typeof Zotero.Prefs.get(key = 'translators.better-bibtex.newTranslatorsAskRestart') !== 'undefined') Zotero.Prefs.clear(key)

    // migrate ancient keys
    if ((old = Zotero.Prefs.get(key = 'translators.better-bibtex.quickCopyMode')) === 'orgmode_citekey') {
      Zotero.Prefs.set(key, 'orgmode')
      Zotero.Prefs.set('translators.better-bibtex.quickCopyOrgMode', 'citationkey')
    }
    if ((old = Zotero.Prefs.get(key = 'translators.better-bibtex.quickCopyMode')) === 'selectLink_citekey') {
      Zotero.Prefs.set(key, 'selectlink')
      Zotero.Prefs.set('translators.better-bibtex.quickCopySelectLink', 'citationkey')
    }
    if ((old = Zotero.Prefs.get(key = 'translators.better-bibtex.quickCopyMode')) === 'selectLink') {
      Zotero.Prefs.set(key, 'selectlink')
    }
    if (typeof (old = Zotero.Prefs.get(key = 'translators.better-bibtex.workers')) !== 'undefined') {
      Zotero.Prefs.rootBranch.setIntPref('extensions.zotero.translators.better-bibtex.workers', typeof old === 'number' ? old : 1)
    }
    if (typeof (old = Zotero.Prefs.get(key = 'translators.better-bibtex.workersMax')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('translators.better-bibtex.workers', typeof old === 'number' ? old : 1)
    }
    if (typeof (old = Zotero.Prefs.get(key = 'translators.better-bibtex.workersCache')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.rootBranch.setBoolPref('extensions.zotero.translators.better-bibtex.caching', !!old)
    }
    if (typeof (old = Zotero.Prefs.get(key = 'translators.better-bibtex.caching')) !== 'boolean') {
      Zotero.Prefs.rootBranch.setBoolPref('extensions.zotero.translators.better-bibtex.caching', !!old)
    }
    if (typeof (old = Zotero.Prefs.get(key = 'translators.better-bibtex.suppressTitleCase')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('translators.better-bibtex.exportTitleCase', !old)
    }
    if (typeof (old = Zotero.Prefs.get(key = 'translators.better-bibtex.suppressBraceProtection')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('translators.better-bibtex.exportBraceProtection', !old)
    }
    if (typeof (old = Zotero.Prefs.get(key = 'translators.better-bibtex.suppressSentenceCase')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('translators.better-bibtex.importSentenceCase', old ? 'off' : 'on+guess')
    }
    if (typeof (old = Zotero.Prefs.get(key = 'translators.better-bibtex.suppressNoCase')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('translators.better-bibtex.importCaseProtection', old ? 'off' : 'as-needed')
    }
    if (typeof (old = Zotero.Prefs.get(key = 'translators.better-bibtex.autoPin')) !== 'undefined') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set('translators.better-bibtex.autoPinDelay', old ? 1 : 0)
    }
    if (Zotero.Prefs.get(key = 'translators.better-bibtex.autoExportDelay') === 1) {
      Zotero.Prefs.set(key, defaults.autoExportDelay)
    }

    // set defaults and install event emitter
    for (const pref of names) {
      if (pref !== 'platform') {
        if (typeof this[pref] === 'undefined') (this[pref] as any) = (typeof defaults[pref] === 'string' ? (defaults[pref] as string).replace(/^\u200B/, '') : defaults[pref])
        Zotero.Prefs.registerObserver(`${this.prefix}${pref}`, this.changed.bind(this, pref))
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
          if (!(property in object)) throw new TypeError(`Unsupported preference ${new String(property)}`) // eslint-disable-line no-new-wrappers
          object[property] = value
          return true
        },
        get: (object, property) => {
          if (!(property in object)) throw new TypeError(`Unsupported preference ${new String(property)}`) // eslint-disable-line no-new-wrappers
          return object[property] // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
      })
    }
  }
}
