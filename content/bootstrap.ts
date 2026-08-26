/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

declare const Cc: any
declare const Ci: any
declare const dump: (msg: string) => void

import { alert } from './prompt'

import { jwk as pubkey } from './public'
import { DebugLogSender } from 'zotero-plugin/debug-log'

import { Monkey } from './monkey-patch'
let monkey: Monkey | undefined

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
    Zotero.debug(`Better BibTeX bootstrap: ${msg}`) // eslint-disable-line no-restricted-syntax
  }
  else {
    dump(`${msg}\n`) // eslint-disable-line no-restricted-syntax
  }
}

export function install(_data: any, _reason: ReasonId) {
  log('install, nothing to do')
}

export function onMainWindowLoad({ window }) {
  log('onMainWindowLoad')
  Zotero.BetterBibTeX.onMainWindowLoad({ window })
}

export function onMainWindowUnload({ window }) {
  log('onMainWindowUnload')
  Zotero.BetterBibTeX.onMainWindowUnload({ window })
}

let chromeHandle: any = null
let sandbox: any = null

function makeSandbox(wantGlobalProperties: string[] = []): any {
  const Sandbox = Components.utils.Sandbox as unknown as new(principal: any, options?: any) => any
  return new Sandbox(Components.utils.getObjectPrincipal(globalThis), {
    freshZone: true,
    freshCompartment: true,
    wantGlobalProperties,
  })
}

export async function startup({ resourceURI, rootURI = resourceURI.spec }: { resourceURI: any; rootURI?: string }, reason: ReasonId) {
  const prefix = 'translators.better-bibtex.'
  const pluginID = 'better-bibtex@iris-advies.com'
  const sender = new DebugLogSender(pluginID, 'Fallback Better BibTeX debug log (if regular fails)', [prefix, `${prefix}$autoExport.`], pubkey)
  sender.enabled = true

  if (Zotero.BetterBibTeX) throw new Error('Better BibTeX is already started')

  // if (!Zotero.Debug.storing && Zotero.Prefs.get('translators.better-bibtex.forceLogging')) Zotero.Debug.setStore(true)
  Zotero.Debug.setStore(true)

  sandbox = makeSandbox([
    'atob',
    'btoa',
    'ChromeUtils',
    'DOMParser',
    'FormData',
    'structuredClone',
    'TextDecoder',
    'TextEncoder',
    'XMLHttpRequest',
    'URL',
    'URLSearchParams',
    'fetch',
  ])

  try {
    log('startup started')

    const aomStartup = Cc['@mozilla.org/addons/addon-manager-startup;1'].getService(Ci.amIAddonManagerStartup)
    const manifestURI = Services.io.newURI(`${rootURI}manifest.json`)
    log(manifestURI.spec)
    chromeHandle = aomStartup.registerChrome(manifestURI, [
      ['content', 'zotero-better-bibtex', 'content/'],
      ['locale', 'zotero-better-bibtex', 'en-US', 'locale/en-US/'],
      ['locale', 'zotero-better-bibtex', 'fr-FR', 'locale/fr-FR/'],
      ['locale', 'zotero-better-bibtex', 'pt-BR', 'locale/pt-BR/'],
      ['locale', 'zotero-better-bibtex', 'zh-CN', 'locale/zh-CN/'],
      ['locale', 'zotero-better-bibtex', 'it-IT', 'locale/it-IT/'],
    ])

    const { FileUtils } = ChromeUtils.importESModule('resource://gre/modules/FileUtils.sys.mjs')
    monkey = new Monkey('better bibtex')
    // Waive Xrays on the sandbox global before assigning properties across compartment boundaries
    Object.assign(Components.utils.waiveXrays(sandbox), {
      monkey,
      Zotero,
      ChromeWorker,
      rootURI,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Localization,
      FileUtils,
      PathUtils,
      IOUtils,
    })

    Services.scriptloader.loadSubScriptWithOptions(`${rootURI}content/better-bibtex.js`, {
      charset: 'utf-8',
      target: sandbox,
    })

    // @ts-expect-error TS2339
    await Zotero.BetterBibTeX.startup(BOOTSTRAP_REASONS[reason])
    log('startup done')

    sender.enabled = false
  }
  catch (err) {
    alert({ title: 'Better BibTeX startup failed', text: `${err}\n${(err as any).stack}` })
    log(`${err}\n${(err as any).stack}`)
  }
}

export async function shutdown(data: any, reason: ReasonId) {
  try {
    log('shutdown started')
    monkey?.disable()
    monkey = undefined

    if (typeof chromeHandle !== 'undefined' && chromeHandle) {
      chromeHandle.destruct()
      chromeHandle = undefined
    }

    if (Zotero.BetterBibTeX) {
      log('shutdown started')
      await Zotero.BetterBibTeX.shutdown(BOOTSTRAP_REASONS[reason])
      log('shutdown completed')
      delete (Zotero as any).BetterBibTeX
      log('BBT deleted')
    }

    // Clear sandbox references to allow GC reaping
    // if (sandbox) Components.utils.nukeSandbox(sandbox)
    sandbox = null

    log('bootstrap: shutdown: done')
  }
  catch (err) {
    alert({ title: 'Better BibTeX shutdown failed', text: `${err}` })
    log(`${err}\n${(err as any).stack}`)
  }
}

export function uninstall(_data: any, _reason: ReasonId) {
  log('uninstall, nothing to do')
}
