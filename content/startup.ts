declare const AddonManager: any

import { flash } from './flash'
import { client } from './client'
import { patch as $patch$ } from './monkey-patch'
import * as supported from '../schema/supported.json'
import { clean_pane_persist } from './clean_pane_persist'

const versionCompare = Components.classes['@mozilla.org/xpcom/version-comparator;1'].getService(Components.interfaces.nsIVersionComparator)
$patch$.enabled = versionCompare.compare(Zotero.version.replace('m', '.').replace(/-beta.*/, ''), supported[client].replace('m', '.')) >= 0

Zotero.debug(`monkey-patch: ${Zotero.version}: BBT ${$patch$.enabled ? 'en' : 'dis'}abled`)
if (!$patch$.enabled) {
  clean_pane_persist()
  flash(`OUTDATED ${client.toUpperCase()} VERSION`, `BBT has been disabled\nNeed at least ${client} ${supported[client]}, found ${Zotero.version}, please upgrade.`, 30) // eslint-disable-line no-magic-numbers

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
