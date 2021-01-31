declare const Zotero: any

import { log } from './logger'
import { Events } from './events'

import * as defaults from '../gen/preferences/defaults.json'
const supported = Object.keys(defaults)

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Preferences = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public branch: any
  public testing: boolean
  public platform: 'win' | 'lin' | 'mac' | 'unix'

  private prefix = 'translators.better-bibtex'

  constructor() {
    this.testing = Zotero.Prefs.get(this.key('testing'))

    let old, key
    if (typeof (old = Zotero.Prefs.get(key = this.key('workers'))) !== 'number') {
      Zotero.Prefs.clear(key)
      Zotero.Prefs.set(key, old ? 1 : 0)
    }
    if (typeof (old = Zotero.Prefs.get(key = this.key('suppressTitleCase'))) !== 'undefined') {
      Zotero.Prefs.set(this.key('exportTitleCase'), !old)
      Zotero.Prefs.clear(key)
    }
    if (typeof (old = Zotero.Prefs.get(key = this.key('suppressBraceProtection'))) !== 'undefined') {
      Zotero.Prefs.set(this.key('exportBraceProtection'), !old)
      Zotero.Prefs.clear(key)
    }
    if (typeof (old = Zotero.Prefs.get(key = this.key('suppressSentenceCase'))) !== 'undefined') {
      if (old) {
        Zotero.Prefs.set(this.key('importSentenceCase'), 'off')
      }
      else {
        Zotero.Prefs.set(this.key('importSentenceCase'), 'on+guess')
      }
      Zotero.Prefs.clear(key)
    }
    if (typeof (old = Zotero.Prefs.get(key = this.key('suppressNoCase'))) !== 'undefined') {
      if (old) {
        Zotero.Prefs.set(this.key('importCaseProtection'), 'off')
      }
      else {
        Zotero.Prefs.set(this.key('importCaseProtection'), 'as-needed')
      }
      Zotero.Prefs.clear(key)
    }
    if (typeof (old = Zotero.Prefs.get(key = this.key('autoPin'))) !== 'undefined') {
      Zotero.Prefs.set(this.key('autoPinDelay'), old ? 1 : 0)
      Zotero.Prefs.clear(key)
    }

    for (const [name, value] of Object.entries(defaults)) {
      // https://groups.google.com/forum/#!topic/zotero-dev/a1IPUJ2m_3s
      if (typeof this.get(name) === 'undefined') this.set(name, value);

      (pref => {
        Zotero.Prefs.registerObserver(`${this.prefix}.${pref}`, _newValue => {
          Events.emit('preference-changed', pref)
        })
      })(name)
    }

    this.set('platform', this.platform = Zotero.isWin ? 'win' : (Zotero.isMac ? 'mac' : (Zotero.isLinux ? 'lin' : 'unix')))
  }

  public set(pref, value) {
    // if (pref === 'testing' && !value) throw new Error(`preference "${pref}" may not be set to false`)
    if (this.testing && !supported.includes(pref)) throw new Error(`Getting unsupported preference "${pref}"`)
    Zotero.Prefs.set(this.key(pref), value)
  }

  public get(pref) {
    if (this.testing && !supported.includes(pref)) throw new Error(`Getting unsupported preference "${pref}"`)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Zotero.Prefs.get(this.key(pref))
  }

  public clear(pref) {
    try {
      Zotero.Prefs.clear(this.key(pref))
    }
    catch (err) {
      log.error('Prefs.clear', pref, err)
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.get(pref)
  }

  public all() {
    const all = {...defaults}
    for (const name of Object.keys(all)) {
      all[name] = this.get(name)
    }
    return all
  }

  private key(pref) { return `${this.prefix}.${pref}` }
}
