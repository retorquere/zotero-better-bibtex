declare const Zotero: any

import * as log from './debug'
import { Events } from './events'

import * as defaults from '../gen/preferences/defaults.json'
const supported = ['debugLogDir', 'removeStock', 'postscriptProductionMode'].concat(Object.keys(defaults))

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Preferences = new class { // tslint:disable-line:variable-name
  public branch: any
  public testing: boolean

  private prefix = 'translators.better-bibtex'

  constructor() {
    this.testing = Zotero.Prefs.get(this.key('testing'))

    for (const [name, value] of Object.entries(defaults)) {
      // https://groups.google.com/forum/#!topic/zotero-dev/a1IPUJ2m_3s
      if (typeof this.get(name) === 'undefined') this.set(name, value);

      (pref => {
        Zotero.Prefs.registerObserver(`${this.prefix}.${pref}`, newValue => {
          Events.emit('preference-changed', pref)
        })
      })(name)
    }
  }

  public set(pref, value) {
    if (pref === 'testing' && !value) throw new Error(`preference "${pref}" may not be set to false`)
    if (this.testing && !supported.includes(pref)) throw new Error(`Getting unsupported preference "${pref}"`)
    Zotero.Prefs.set(this.key(pref), value)
  }

  public get(pref) {
    if (this.testing && !supported.includes(pref)) throw new Error(`Getting unsupported preference "${pref}"`)
    return Zotero.Prefs.get(this.key(pref))
  }

  public clear(pref) {
    try {
      Zotero.Prefs.clear(this.key(pref))
    } catch (err) {
      log.error('Prefs.clear', pref, err)
    }
    return this.get(pref)
  }

  private key(pref) { return `${this.prefix}.${pref}` }
}
