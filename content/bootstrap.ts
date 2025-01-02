/* eslint-disable @typescript-eslint/no-unsafe-argument, prefer-rest-params, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-return */

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
  msg = `{better-bibtex} bootstrap: ${ msg }`
  if (Zotero?.debug) {
    Zotero.debug(`Better BibTeX bootstrap: ${ msg }`) // eslint-disable-line no-restricted-syntax
  }
  else {
    dump(`${ msg }\n`) // eslint-disable-line no-restricted-syntax
  }
}

export function install(_data: any, _reason: ReasonId) {
  log('install, nothing to do')
}

export function onMainWindowLoad({ window }) {
  log('onMainWindowLoad')
  window.MozXULElement.insertFTLIfNeeded('better-bibtex.ftl')
  Zotero.BetterBibTeX.onMainWindowLoad({ window })
}

export function onMainWindowUnload({ window }) {
  log('onMainWindowUnload')
  Zotero.BetterBibTeX.onMainWindowUnload({ window })
}

let chromeHandle
export async function startup({ resourceURI, rootURI = resourceURI.spec }, reason: ReasonId) {
  try {
    log('startup started')

    const aomStartup = Cc['@mozilla.org/addons/addon-manager-startup;1'].getService(Ci.amIAddonManagerStartup)
    const manifestURI = Services.io.newURI(`${ rootURI }manifest.json`)
    chromeHandle = aomStartup.registerChrome(manifestURI, require('../gen/chrome.json'))

    if (Zotero.BetterBibTeX) throw new Error('Better BibTeX is already started')

    const $window = Cc['@mozilla.org/appshell/appShellService;1'].getService(Ci.nsIAppShellService).hiddenDOMWindow
    Services.scriptloader.loadSubScriptWithOptions(`${ rootURI }content/better-bibtex.js`, {
      charset: 'utf=8',
      // ignoreCache: true,
      target: {
        Zotero,
        // because the Zotero sample code assumes you're doing everything in bootstrap.js
        rootURI,

        // to pacify libraries that do env-detection
        window: $window,
        document: $window.document,

        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,

        /*
        // indexedDB: $window.indexedDB,
        IDBRequest: $window.IDBRequest,
        IDBTransaction: $window.IDBTransaction,
        IDBDatabase: $window.IDBDatabase,
        IDBObjectStore: $window.IDBObjectStore,
        IDBIndex: $window.IDBIndex,
        IDBCursor: $window.IDBCursor,
        IDBKeyRange: $window.IDBKeyRange,
        Event: $window.Event,
        */
      },
    })

    await Zotero.BetterBibTeX.startup(BOOTSTRAP_REASONS[reason])
    Zotero.PreferencePanes.register({
      pluginID: 'better-bibtex@iris-advies.com',
      src: `${ rootURI }content/preferences.xhtml`,
      stylesheets: [`${ rootURI }content/preferences.css`],
      label: 'Better BibTeX',
      defaultXUL: true,
    })
    log('startup done')
    onMainWindowLoad({ window: Zotero.getMainWindow() })
  }
  catch (err) {
    alert({ title: 'Better BibTeX startup failed', text: `${err}\n${err.stack}` })
    log(`${ err }\n${err.stack}`)
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
    alert({ title: 'Better BibTeX shutdown failed', text: `${ err }` })
    log(`${ err }\n${ err.stack }`)
  }
}

export function uninstall(_data: any, _reason: ReasonId) {
  log('uninstall, nothing to do')
}
