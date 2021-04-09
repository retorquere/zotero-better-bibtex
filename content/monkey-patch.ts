declare const AddonManager: any

import { flash } from './flash'
import { client } from './client'
import * as min_version from '../gen/min-version.json'

export function clean_pane_persist(): void {
  let persisted = Zotero.Prefs.get('pane.persist')
  if (persisted) {
    try {
      persisted = JSON.parse(persisted)
      delete persisted['zotero-items-column-citekey']
      Zotero.Prefs.set('pane.persist', JSON.stringify(persisted))
    }
    catch (err) {
      Zotero.logError(err)
    }
  }
}

const versionCompare = Components.classes['@mozilla.org/xpcom/version-comparator;1'].getService(Components.interfaces.nsIVersionComparator)
export const enabled = versionCompare.compare(Zotero.version.replace('m', '.').replace(/-beta.*/, ''), min_version[client].replace('m', '.')) >= 0

Zotero.debug(`monkey-patch: ${Zotero.version}: BBT ${enabled ? 'en' : 'dis'}abled`)
if (!enabled) {
  clean_pane_persist()
  flash(`OUTDATED ${client.toUpperCase()} VERSION`, `BBT has been disabled\nNeed at least ${client} ${min_version[client]}, found ${Zotero.version}, please upgrade.`, 30) // eslint-disable-line no-magic-numbers

  Components.utils.import('resource://gre/modules/AddonManager.jsm')
  AddonManager.getAddonByID('better-bibtex@iris-advies.com', addon => { addon.userDisabled = true })
  /*
    // Add-on cannot be uninstalled
    if (!(addon.permissions & AddonManager.PERM_CAN_UNINSTALL)) return

    addon.uninstall()
    // if (addon.pendingOperations & AddonManager.PENDING_UNINSTALL) {
    // Need to restart to finish the uninstall.
    // Might ask the user to do just that. Or not ask and just do.
    // Or just wait until the browser is restarted by the user.
    // }
  })
  */
}

const marker = 'BetterBibTeXMonkeyPatched'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types
export function repatch(object: any, method: string, patcher: ((Function) => Function)): void {
  if (!enabled) return
  object[method] = patcher(object[method])
  object[method][marker] = true
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types
export function patch(object: any, method: string, patcher: ((Function) => Function)): void {
  if (!enabled) return
  if (object[method][marker]) throw new Error(`${method} re-patched`)
  repatch(object, method, patcher)
}
