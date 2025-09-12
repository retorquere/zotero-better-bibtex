const {
  interfaces: Ci,
  results: Cr,
  utils: Cu,
  Constructor: CC,
} = Components

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

const { AddonManager } = ChromeUtils.import('resource://gre/modules/AddonManager.jsm')

if (typeof Zotero == 'undefined') {
  var Zotero
}

const BOOTSTRAP_REASONS = {
  1: 'APP_STARTUP',
  2: 'APP_SHUTDOWN',
  3: 'ADDON_ENABLE',
  4: 'ADDON_DISABLE',
  5: 'ADDON_INSTALL',
  6: 'ADDON_UNINSTALL',
  7: 'ADDON_UPGRADE',
  8: 'ADDON_DOWNGRADE',
};

function log(msg) {
  // `Zotero` object isn't available in `uninstall()` in Zotero 6, so log manually
  if (typeof Zotero === 'undefined') {
    dump(`Debug bridge: ${msg}\n\n`)
  }
  else {
    Zotero.debug(`Debug bridge: ${msg}`)
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

  var windows = Services.wm.getEnumerator('navigator:browser')
  var found = false
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
      var listener = {
        onOpenWindow(aWindow) {
          // Wait for the window to finish loading
          const domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow)
          domWindow.addEventListener('load', function() {
            domWindow.removeEventListener('load', arguments.callee, false)
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
  var branch = Services.prefs.getDefaultBranch('')
  var obj = {
    pref(pref, value) {
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
  try {
    Services.scriptloader.loadSubScript(`${rootURI}prefs.js`, obj)
  }
  catch (err) {
    log(`could not load prefs: ${err}`)
  }
}

function install(data, reason) {
}

class DebugBridge {
  async enable(addonID) {
    log(`plugin management: enabling ${addonID}`)
    const addon = await AddonManager.getAddonByID(addonID)
    await addon.enable()
    log(`plugin management: ${addonID} enabled`)
  }
  async disable(addonID) {
    log(`plugin management: disabling ${addonID}`)
    const addon = await AddonManager.getAddonByID(addonID)
    await addon.disable()
    if (addonID === 'better-bibtex@iris-advies.com') await this.busyWait(() => !Zotero.BetterBibTeX)
    log(`plugin management: ${addonID} disabled`)
  }
  async install(xpi) {
    log(`installing ${xpi}`)
    const addon = await AddonManager.getInstallForFile(Zotero.File.pathToFile(xpi))
    if (addon.state === AddonManager.STATE_AVAILABLE) await addon.install()
  }
  async uninstall(xpi) {
    const addon = await AddonManager.getAddonByID(addonID)
    await addon.uninstall()
  }

  async busyWait(test, msecs = 5000) {
    const start = Date.now()
    const delay = 10
    while (!test()) {
      await Zotero.Promise.delay(delay)
      if (Date.now() - start > msecs) throw new Error(`timeout after ${msecs}ms`)
    }
  }
}

async function startup({ resourceURI, rootURI = resourceURI.spec }, reason) {
  log(`async:startup:start, Zotero: ${typeof Zotero !== 'undefined'}`)
  await waitForZotero()

  // Read prefs from prefs.js when the plugin in Zotero 6
  if (Zotero.platformMajorVersion < 102) {
    setDefaultPrefs(rootURI)
  }

  Zotero.Server.Endpoints['/debug-bridge/execute'] = class {
    constructor() {
      this.supportedMethods = ['POST']
      this.supportedDataTypes = ['application/javascript', 'text/plain']
      this.permitBookmarklet = false
    }

    duration(start) {
      return new Date(Date.now() - start).toISOString().split('T')[1].replace('Z', '')
    }

    async init(request) {
      const token = {
        expected: `Bearer ${Zotero.Prefs.get('debug-bridge.token') || ''}`,
        found: (request.headers || {}).Authorization || '',
      }

      if (token.expected.trim() === 'Bearer') return [500, 'text/plain', 'token not configured'];
      if (!token.found) return [401, 'text/plain', 'bearer token required'];

      if (token.expected !== token.found) return [401, 'text/plain', 'invalid bearer token']

      let query = {}
      if (request.query) query = {...request.query}
      if (request.searchParams) {
        query[''] = request.searchParams.toString()
        for (const [key, value] of request.searchParams) {
          query[key] = value
        }
      }

      const script = request.data.trim().match(/^\/\/ debug bridge:(?<script>[^\r\n]+)/i)?.groups?.script || request.data
      log(`executing\n${script} with ${JSON.stringify(query)}`)
      const start = Date.now()
      let response
      try {
        let action = new AsyncFunction('query', request.data)
        response = await action(query)
        if (typeof response === 'undefined') response = null
        response = JSON.stringify(response)
      } catch (err) {
        log(`failed (${this.duration(start)}): ${err}`)
        return [500, 'application/text', `debug-bridge failed: ${err}\n${err.stack}`];
      }
      log(`succeeded (${this.duration(start)})`)
      return [201, 'application/json', response]
    }
  }

  Zotero.DebugBridge = new DebugBridge
}

async function shutdown(data, reason) {
  log('async:shutdown:start')
  await waitForZotero()
  if (Zotero) {
    delete Zotero.Server.Endpoints['/debug-bridge/execute']
    delete Zotero.DebugBridge
  }
}

function uninstall(data, reason) {
  log('async:uninstall:start')
}
