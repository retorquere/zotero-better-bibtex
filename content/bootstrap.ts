/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/ban-types, prefer-rest-params, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-return */

var Zotero: any // eslint-disable-line no-var
declare const ChromeUtils: any
declare const Components: any
declare const dump: (msg: string) => void

import { flash } from './flash'
import * as supported from '../schema/supported.json'
import { clean_pane_persist } from './clean_pane_persist'

/*
type Deferred = Promise<void> & { resolve: () => void, reject: (err: Error) => void }
const defer = (): Deferred => {
  const bag = {}
  return Object.assign(
    new Promise((resolve, reject) => Object.assign(bag, { resolve, reject })) as Partial<Deferred>,
    bag
  ) as Deferred
}

const bootstrap: {
  install?: Deferred
  startup?: Deferred
  shutdown?: Deferred
  uninstall?: Deferred
} = {}
*/

const BOOTSTRAP_REASONS = {
  1: 'APP_STARTUP',
  2: 'APP_SHUTDOWN',
  3: 'ADDON_ENABLE',
  4: 'ADDON_DISABLE',
  5: 'ADDON_INSTALL',
  6: 'ADDON_UNINSTALL',
  7: 'ADDON_UPGRADE',
  8: 'ADDON_DOWNGRADE',
} as const
type ReasonId = keyof typeof BOOTSTRAP_REASONS
export type Reason = typeof BOOTSTRAP_REASONS[ReasonId]

function approxVersion(v: string): string {
  return v
    .replace(/m|-beta/, '.')
    // https://github.com/retorquere/zotero-better-bibtex/issues/2093#issuecomment-1082885183
    .replace(/\.SOURCE.*/, `.${Number.MAX_SAFE_INTEGER}`.slice(0, -1))
}

function log(msg) {
  msg = `{better-bibtex} bootstrap: ${msg}`
  if (Zotero?.debug) {
    Zotero.debug(`Better BibTeX bootstrap: ${msg}`)
  }
  else {
    dump(`${msg}\n`)
  }
}

// In Zotero 6, bootstrap methods are called before Zotero is initialized, and using include.js
// to get the Zotero XPCOM service would risk breaking Zotero startup. Instead, wait for the main
// Zotero window to open and get the Zotero object from there.
//
// In Zotero 7, bootstrap methods are not called until Zotero is initialized, and the 'Zotero' is
// automatically made available.
async function waitForZotero() {
  if (typeof Zotero != 'undefined') {
    await Zotero.initializationPromise
    return
  }

  if (typeof Services == 'undefined') {
    var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm') // eslint-disable-line no-var
  }
  const windows = Services.wm.getEnumerator('navigator:browser')
  let found = false
  while (windows.hasMoreElements()) {
    const win = windows.getNext()
    if (win.Zotero) {
      Zotero = win.Zotero
      found = true
      break
    }
  }
  if (!found) {
    await new Promise(resolve => {
      const listener = {
        onOpenWindow: aWindow => {
          // Wait for the window to finish loading
          const domWindow = aWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindowInternal || Components.interfaces.nsIDOMWindow)
          domWindow.addEventListener('load', () => {
            domWindow.removeEventListener('load', arguments.callee, false) // eslint-disable-line no-caller
            if (domWindow.Zotero) {
              Services.wm.removeListener(listener)
              Zotero = domWindow.Zotero
              resolve(undefined)
            }
          }, false)
        },
      }
      Services.wm.addListener(listener)
    })
  }
  await Zotero.initializationPromise
}

// Loads default preferences from prefs.js in Zotero 6
function setDefaultPrefs(rootURI) {
  if (typeof Services == 'undefined') {
    var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm') // eslint-disable-line no-var
  }
  const branch = Services.prefs.getDefaultBranch('')
  const obj = {
    pref: (pref, value) => {
      switch (typeof value) {
        case 'boolean':
          branch.setBoolPref(pref, value)
          break
        case 'string':
          branch.setStringPref(pref, value)
          break
        case 'number':
          branch.setIntPref(pref, value)
          break
        default:
          Zotero.logError(`Invalid type '${typeof(value)}' for pref '${pref}'`)
      }
    },
  }
  Services.scriptloader.loadSubScript(`${rootURI}prefs.js`, obj)
}

export async function install(_data: any, reason: ReasonId) {
  await waitForZotero()
  await Zotero.BetterBibTeX.orchestrator.startup(BOOTSTRAP_REASONS[reason])
}

export async function startup({ resourceURI, rootURI = resourceURI.spec }, reason: ReasonId) {
  await waitForZotero()

  const client = Zotero.clientName.toLowerCase().replace('-', '')
  const versionCompare = Components.classes['@mozilla.org/xpcom/version-comparator;1'].getService(Components.interfaces.nsIVersionComparator)
  if (versionCompare.compare(approxVersion(Zotero.version), approxVersion(supported[client])) < 0) {
    clean_pane_persist()

    log(`Unsupported ${client} ${Zotero.version}, not starting`)

    // eslint-disable-next-line no-magic-numbers
    flash(`OUTDATED ${client.toUpperCase()} VERSION ${Zotero.version}`, `Better BibTeX has been disabled\nNeed at least ${client} ${supported[client]}, found ${Zotero.version}, please upgrade.`, 30)

    return
  }

  if (Zotero.BetterBibTeX) throw new Error('Better BibTeX is already started')

  log('Starting')
  // 'Services' may not be available in Zotero 6
  if (typeof Services == 'undefined') {
    var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm') // eslint-disable-line no-var
  }

  setDefaultPrefs(rootURI)

  Services.scriptloader.loadSubScript(`${rootURI}content/better-bibtex.js`, {
    Zotero,

    setTimeout: Zotero.setTimeout,
    clearTimeout: Zotero.clearTimeout,
    setInterval: Zotero.setInterval,
    clearInterval: Zotero.clearInterval,
  }, 'utf-8')

  await Zotero.BetterBibTeX.orchestrator.startup(BOOTSTRAP_REASONS[reason])
}

export async function shutdown(data: any, reason: ReasonId) {
  if (Zotero.BetterBibTeX) {
    await Zotero.BetterBibTeX.orchestrator.shutdown(BOOTSTRAP_REASONS[reason])
    delete Zotero.BetterBibTeX
  }
}

export async function uninstall(data: any, reason: ReasonId) {
  if (Zotero.BetterBibTeX) {
    await Zotero.BetterBibTeX.orchestrator.shutdown(BOOTSTRAP_REASONS[reason])
    delete Zotero.BetterBibTeX
  }
}
