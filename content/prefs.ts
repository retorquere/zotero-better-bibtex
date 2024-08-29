/* eslint-disable max-len */
declare const Services: any

import { Shim } from './os'
import * as client from './client'
const $OS = client.is7 ? Shim : OS

import { Events } from './events'
import type { CharMap } from 'unicode2latex'

declare const Zotero: any

import { Preferences as $Preferences, PreferenceName, defaults } from '../gen/preferences/meta'
import { PreferenceManager as PreferenceManagerBase } from '../gen/preferences'
import { dict as csv2dict } from './load-csv'
import { log } from './logger'
import { flash } from './flash'
import { pick } from './object'

export const Preference = new class PreferenceManager extends PreferenceManagerBase {
  public prefix = 'translators.better-bibtex.'
  private observers: number[] = []
  private minimum = {
    autoExportIdleWait: 1,
    autoExportDelay: 1,
    itemObserverDelay: 5,
  }

  constructor() {
    super()

    for (const pref of Object.keys(this.minimum)) {
      this.repair(pref)
    }

    this.baseAttachmentPath = Zotero.Prefs.get('baseAttachmentPath')
    this.observers.push(Zotero.Prefs.registerObserver('baseAttachmentPath', val => { this.baseAttachmentPath = val }))

    this.migrate()
    this.setDefaultPrefs()

    // put this in a preference so that translators can access this.
    this.platform = client.platform

    if (this.testing) {
      return new Proxy(this, {
        set: (object, property, value) => {
          if (!(property in object)) {
            const stack = (new Error).stack
            throw new TypeError(`Unsupported preference ${ new String(property) } ${ stack }`) // eslint-disable-line no-new-wrappers
          }
          object[property] = value
          return true
        },
        get: (object, property) => {
          if (!(property in object)) {
            const stack = (new Error).stack
            throw new TypeError(`Unsupported preference ${ new String(property) } ${ stack }`) // eslint-disable-line no-new-wrappers
          }
          return object[property] // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
      })
    }

    Events.itemObserverDelay = this.itemObserverDelay
  }

  setDefaultPrefs() {
    const branch = Services.prefs.getDefaultBranch('')
    for (const [ pref, value ] of Object.entries(defaults)) {
      const name = `extensions.zotero.translators.better-bibtex.${ pref }`
      let error = ''
      try {
        switch (typeof value) {
          case 'boolean':
            branch.setBoolPref(name, value)
            break
          case 'string':
            branch.setStringPref(name, value)
            break
          case 'number':
            branch.setIntPref(name, value)
            break
          default:
            error = `invalid default type '${ typeof (value) }' for '${ pref }'`
            break
        }
      }
      catch {
        error = `could not set default for ${ pref } to ${ typeof value } ${ JSON.stringify(value) }`
      }
      if (error) {
        const v = Zotero.Prefs.get(`translators.better-bibtex.${ pref }`)
        if (typeof v !== 'undefined') error += `, value currently set to ${ typeof v } ${ JSON.stringify(v) }`
        log.error(error)
        flash(`could not set default ${ pref }`, error, 20)
        Zotero.Prefs.clear(name)
      }
    }
  }

  observe(pref: string) {
    this.observers.push(Zotero.Prefs.registerObserver(`${ this.prefix }${ pref }`, this.changed.bind(this, pref)))
  }

  repair(pref) {
    const min = this.minimum[pref]
    if (typeof min === 'undefined') return

    if (this[pref] < min) {
      this[pref] = min
      return true
    }
    else {
      return false
    }
  }

  changed(pref: string) {
    // prevent foot-guns
    if (this.repair(pref)) return
    if (pref === 'itemObserverDelay') Events.itemObserverDelay = this.itemObserverDelay
    void Events.emit('preference-changed', pref)
  }

  private migrate() {
    let key

    // clear out old keys
    const oops = 'extensions.translators.better-bibtex.'
    for (key of Services.prefs.getBranch(oops).getChildList('', {}) as string[]) {
      Zotero.Prefs.clear(oops + key, true) // eslint-disable-line @typescript-eslint/restrict-plus-operands
    }

    // migrate ancient keys
    if (Zotero.Prefs.get(key = 'translators.better-bibtex.quickCopyMode') === 'orgmode_citekey') {
      Zotero.Prefs.set(key, 'orgmode')
      Zotero.Prefs.set('translators.better-bibtex.quickCopyOrgMode', 'citationkey')
    }
    if (Zotero.Prefs.get(key = 'translators.better-bibtex.quickCopyMode') === 'selectLink_citekey') {
      Zotero.Prefs.set(key, 'selectlink')
      Zotero.Prefs.set('translators.better-bibtex.quickCopySelectLink', 'citationkey')
    }
    if (Zotero.Prefs.get(key = 'translators.better-bibtex.autoExportDelay') === 1) {
      Zotero.Prefs.set(key, defaults.autoExportDelay)
    }

    Zotero.Prefs.clear('translators.better-bibtex.worker')
    Zotero.Prefs.clear('translators.better-bibtex.workersCache')
    Zotero.Prefs.clear('translators.better-bibtex.workersMax')
    Zotero.Prefs.clear('translators.better-bibtex.workers')
    Zotero.Prefs.clear('translators.better-bibtex.citeprocNoteCitekey')
    Zotero.Prefs.clear('translators.better-bibtex.newTranslatorsAskRestart')
    Zotero.Prefs.clear('translators.better-bibtex.caching')
    Zotero.Prefs.clear('translators.better-bibtex.citekeyFormatBackup')

    this.move('autoPin', 'autoPinDelay', old => old ? 1 : 0)
    this.move('suppressNoCase', 'importCaseProtection', old => old ? 'off' : 'as-needed')
    this.move('suppressSentenceCase', 'importSentenceCase', old => old ? 'off' : 'on+guess')
    this.move('suppressBraceProtection', 'exportBraceProtection', old => !old)
    this.move('suppressTitleCase', 'exportTitleCase', old => !old)

    // put this in a preference so that translators can access this.
    this.platform = client.platform

    if (this.testing) {
      return new Proxy(this, {
        set: (object, property, value) => {
          if (!(property in object)) throw new TypeError(`Unsupported preference ${ new String(property) }`) // eslint-disable-line no-new-wrappers
          object[property] = value
          return true
        },
        get: (object, property) => {
          if (!(property in object)) throw new TypeError(`Unsupported preference ${ new String(property) }`) // eslint-disable-line no-new-wrappers
          return object[property] // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
      })
    }
  }

  private move(ist: string, soll: string, convert: (v: any) => any) {
    if (!ist.match(/[.]/)) ist = `translators.better-bibtex.${ ist }`
    if (!soll.match(/[.]/)) soll = `translators.better-bibtex.${ soll }`
    const old = Zotero.Prefs.get(ist)
    if (typeof old === 'undefined') return
    Zotero.Prefs.clear(ist)
    Zotero.Prefs.set(soll, convert(old))
  }

  private async loadFromCSV(pref: string, path: string, dflt: string, transform: (row: any) => any) {
    const key = `${ this.prefix }${ pref }`
    const modified = {
      pref: Zotero.Prefs.get(`${ key }.modified`) || 0,
      file: (await $OS.File.exists(path)) ? (await $OS.File.stat(path)).lastModificationDate.getTime() : 0,
    }
    if (modified.pref >= modified.file) return

    Zotero.Prefs.set(`${ key }.modified`, modified.file)
    const rows = await csv2dict(path)
    try {
      this[pref] = rows.length ? transform(rows) : dflt
    }
    catch (err) {
      log.error('error loading pref', pref, 'from', path, ':', err)
      this[pref] = dflt
    }
  }

  public async startup(dir: string) {
    // load from csv for easier editing
    await this.loadFromCSV('charmap', $OS.Path.join(dir, 'charmap.csv'), '{}', (rows: Record<string, string>[]) => JSON.stringify(
      rows.reduce((acc: CharMap, row: { unicode: string; text: string; math: string }) => {
        if (row.unicode && (row.math || row.text)) acc[row.unicode] = { text: row.text, math: row.math }
        return acc
      }, {})
    ))

    for (const pref of Object.keys(defaults)) {
      if (pref !== 'platform' && pref !== 'testing') {
        // install event emitter
        this.observe(pref)
      }
    }
  }

  pick(keys: PreferenceName[]): Partial<$Preferences> {
    return pick(this, keys) as Partial<$Preferences>
  }

  public shutdown() {
    this.observers.forEach(id => { Zotero.Prefs.unregisterObserver(id) })
  }
}
