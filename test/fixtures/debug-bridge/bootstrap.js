const {
  interfaces: Ci,
  results: Cr,
  utils: Cu,
  Constructor: CC,
} = Components

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

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

const prefix = 'Debug bridge:'
function log(msg) {
  // `Zotero` object isn't available in `uninstall()` in Zotero 6, so log manually
  if (typeof Zotero === 'undefined') {
    dump(`${prefix} ${msg}\n\n`)
  }
  else {
    if (Zotero.DebugBridge) msg = `:${Zotero.DebugBridge}: ${msg}`
    Zotero.debug(`${prefix} ${msg}`)
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

  var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm')
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

function unpack(phase, { id, version, resourceURI, rootURI = resourceURI.spec }, reason) {
  data = { id, version, rootURI, reason: BOOTSTRAP_REASONS[reason] || reason }
  log(`bootstrap::${phase}(${data.reason}) ${JSON.stringify(data)}`)
  return data
}

async function install(data, reason) {
  await waitForZotero()
  unpack('install', data, reason)
}

async function startup(data, reason) {
  await waitForZotero()
  const { rootURI } = unpack('startup', data, reason)

  // 'Services' may not be available in Zotero 6
  if (typeof Services == 'undefined') {
    var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm')
  }

  // Read prefs from prefs.js when the plugin in Zotero 6
  if (Zotero.platformMajorVersion < 102) {
    setDefaultPrefs(rootURI)
  }

  Zotero.Server.Endpoints['/debug-bridge/execute'] = class {
    constructor() {
      this.supportedMethods = ['POST']
      this.supportedDataTypes = 'application/javascript'
      this.permitBookmarklet = false
    }

    async init(options) {
      const password = {
        expected: Zotero.Prefs.get('debug-bridge.password') || '',
        found: (options.query || {}).password || '',
      }

      if (!password.expected) return [500, 'text/plain', 'password not configured'];
      if (!password.found) return [401, 'text/plain', 'password required'];
      if (password.expected !== password.found)  return [401, 'text/plain', 'invalid password'];

      log(`executing\n${options.data}`)
      let start = new Date
      let response
      try {
        let action = new AsyncFunction('query', options.data)
        response = await action(options.query)
        if (typeof response === 'undefined') response = null
        response = JSON.stringify(response)
      } catch (err) {
        log(`failed (${(new Date) - start} ms): ${err}`)
        return [500, 'application/text', `debug-bridge failed: ${err}\n${err.stack}`];
      }
      log(`succeeded (${(new Date) - start}ms)`)
      return [201, 'application/json', response]
    }
  }
}

function shutdown(data, reason) {
  unpack('shutdown', data, reason)
  if (Zotero) delete Zotero.Server.Endpoints['/debug-bridge/execute']
}

function uninstall(data, reason) {
  unpack('uninstall', data, reason)
}
