/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/ban-types, prefer-rest-params, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-return */

declare const Cc: any
declare const Ci: any
declare const dump: (msg: string) => void

import { alert } from './prompt'

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
  Services.scriptloader.loadSubScriptWithOptions(`${rootURI}prefs.js`, {
    target: obj,
    charset: 'utf-8',
    // ignoreCache: true
  })
}

export function install(_data: any, _reason: ReasonId) {
  log('install, nothing to do')
}

let chromeHandle
export async function startup({ resourceURI, rootURI = resourceURI.spec }, reason: ReasonId) {
  try {
    log('startup started')

    const aomStartup = Cc['@mozilla.org/addons/addon-manager-startup;1'].getService(Ci.amIAddonManagerStartup)
    const manifestURI = Services.io.newURI(`${rootURI}manifest.json`)
    chromeHandle = aomStartup.registerChrome(manifestURI, require('../chrome.json'))

    if (Zotero.BetterBibTeX) throw new Error('Better BibTeX is already started')

    setDefaultPrefs(rootURI)

    Services.scriptloader.loadSubScriptWithOptions(`${rootURI}content/better-bibtex.js`, {
      charset: 'utf=8',
      // ignoreCache: true,
      target: {
        Zotero,

        // to pacify libraries that do env-detection
        window: Zotero.getMainWindow(),
        document: Zotero.getMainWindow().document,

        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
      },
    })

    await Zotero.BetterBibTeX.startup(BOOTSTRAP_REASONS[reason])
    Zotero.PreferencePanes.register({
      pluginID: 'better-bibtex@iris-advies.com',
      src: `${rootURI}content/preferences.xhtml`,
      stylesheets: [`${rootURI}content/preferences.css`],
      label: 'Better BibTeX',
      defaultXUL: true,
    })
    log('startup done')
  }
  catch (err) {
    alert({ title: 'Better BibTeX startup failed', text: `${err}` })
    log(`${err}\n${err.stack}`)
  }
}

export async function shutdown(data: any, reason: ReasonId) {
  try {
    log('shutdown started')

    if (typeof chromeHandle !== 'undefined') {
      chromeHandle.destruct()
      chromeHandle = undefined
    }
    if (Zotero.BetterBibTeX) {
      log('shutdown started')
      await Zotero.BetterBibTeX.shutdown(BOOTSTRAP_REASONS[reason])
      log('shutdown completed')
      delete Zotero.BetterBibTeX
      log('BBT deleted')
    }
    log('shutdown done')
  }
  catch (err) {
    alert({ title: 'Better BibTeX shutdown failed', text: `${err}` })
    log(`${err}\n${err.stack}`)
  }
}

export function uninstall(_data: any, _reason: ReasonId) {
  log('uninstall, nothing to do')
}
