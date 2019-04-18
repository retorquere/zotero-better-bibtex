declare const Components: any
declare const Zotero: any

import * as log from './debug'
import { Events } from './events'
import { ZoteroConfig } from './zotero-config'

const supported = Object.keys(require('../gen/preferences/defaults.json'))
supported.push('removeStock')

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Preferences = new class { // tslint:disable-line:variable-name
  public branch: any

  private prefix = 'translators.better-bibtex'
  private testing: boolean

  constructor() {
    this.testing = Zotero.Prefs.get(this.key('testing'))

    const prefService = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService)
    this.branch = prefService.getBranch(`${ZoteroConfig.PREF_BRANCH}${this.prefix}.`)

    // preference upgrades
    for (const pref of this.branch.getChildList('')) {
      switch (pref) {
        case 'jabrefGroups':
          log.debug('Preferences: jabrefGroups -> jabrefFormat')
          this.set('jabrefFormat', this.get(pref))
          this.clear(pref)
          break

        case 'ZotFile':
          this.clear(pref)
          break
      }
    }

    this.branch.addObserver('', this, false)
  }

  public observe(branch, topic, pref) {
    log.debug('preference', pref, 'changed to', this.get(pref))
    Events.emit('preference-changed', pref)
  }

  public set(pref, value) {
    if (this.testing && !supported.includes(pref)) throw new Error(`Unsupported preference "${pref}"`)
    log.debug('Prefs.set', pref, value)
    Zotero.Prefs.set(this.key(pref), value)
  }

  public get(pref) {
    if (this.testing && !supported.includes(pref)) throw new Error(`Unsupported preference "${pref}"`)
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
