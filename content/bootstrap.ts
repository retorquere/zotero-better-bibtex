/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/ban-types, prefer-rest-params, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-return */

var Zotero: any // eslint-disable-line no-var
declare const Cc: any
declare const Ci: any
declare const dump: (msg: string) => void

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

function log(msg) {
  msg = `{better-bibtex} bootstrap: ${msg}`
  if (Zotero?.debug) {
    Zotero.debug(`Better BibTeX bootstrap: ${msg}`)
  }
  else {
    dump(`${msg}\n`)
  }
}

// Loads default preferences from prefs.js in Zotero 6
function setDefaultPrefs(rootURI) {
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

export function install(_data: any, _reason: ReasonId) {
  log('install, nothing to do')
}

let chromeHandle
export async function startup({ resourceURI, rootURI = resourceURI.spec }, reason: ReasonId) {
  log('startup started')

  const aomStartup = Cc['@mozilla.org/addons/addon-manager-startup;1'].getService(Ci.amIAddonManagerStartup)
  const manifestURI = Services.io.newURI(`${rootURI}manifest.json`)
  chromeHandle = aomStartup.registerChrome(manifestURI, require('../chrome.json'))

  if (Zotero.BetterBibTeX) throw new Error('Better BibTeX is already started')

  log('Starting')

  setDefaultPrefs(rootURI)

  Services.scriptloader.loadSubScript(`${rootURI}content/better-bibtex.js`, {
    Zotero,

    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  }, 'utf-8')

  await Zotero.BetterBibTeX.startup(BOOTSTRAP_REASONS[reason])
  log('startup done')
}

export async function shutdown(data: any, reason: ReasonId) {
  log('shutdown started')

  if (typeof chromeHandle !== 'undefined') {
    chromeHandle.destruct()
    chromeHandle = undefined
  }
  if (Zotero.BetterBibTeX) {
    await Zotero.BetterBibTeX.shutdown(BOOTSTRAP_REASONS[reason])
    delete Zotero.BetterBibTeX
  }
  log('shutdown done')
}

export function uninstall(_data: any, _reason: ReasonId) {
  log('uninstall, nothing to do')
}
