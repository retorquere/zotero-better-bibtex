declare const Components: any
declare const Zotero: any

const debug = require('./debug.ts')
const events = require('./events.coffee')
const zotero_config = require('./zotero-config.coffee')

class Preferences {
  private static prefix = 'translators.better-bibtex'
  private branch: any

  constructor() {
    const prefService = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService)
    this.branch = prefService.getBranch(`${zotero_config.PREF_BRANCH}${Preferences.prefix}.`)
    this.branch.addObserver('', this, false)
  }

  private key(pref) { return `${Preferences.prefix}.${pref}` }

  public set(pref, value) {
    debug('Prefs.set', pref, value)
    Zotero.Prefs.set(this.key(pref), value)
  }

  public get(pref) {
    try {
      return Zotero.Prefs.get(this.key(pref))
    } catch (error) {
      return null
    }
  }

  public clear(pref) {
    try {
      Zotero.Prefs.clear(this.key(pref))
    } catch (err) {
      debug('Prefs.clear', pref, err)
    }

  }

  // tslint:disable-next-line:no-unused-variable
  private observe(branch, topic, pref) {
    debug('preference', pref, 'changed to', this.get(pref))
    events.emit('preference-changed', pref)
  }
}

export = new Preferences()
