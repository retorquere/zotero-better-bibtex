declare const AddonManager: any

import { flash } from './flash'
import { client, is7 } from './client'
import * as supported from '../schema/supported.json'
import { clean_pane_persist } from './clean_pane_persist'

function approxVersion(v: string): string {
  return v
    .replace(/m|-beta/, '.')
    // https://github.com/retorquere/zotero-better-bibtex/issues/2093#issuecomment-1082885183
    .replace(/\.SOURCE.*/, `.${Number.MAX_SAFE_INTEGER}`.slice(0, -1))
}

const versionCompare = Components.classes['@mozilla.org/xpcom/version-comparator;1'].getService(Components.interfaces.nsIVersionComparator)
export const enabled = versionCompare.compare(approxVersion(Zotero.version), approxVersion(supported[client])) >= 0
export const started = Date.now()

Zotero.debug(`{better-bibtex-startup} on ${Zotero.version} ${enabled ? 'en' : 'dis'}abled @ ${started}`)
if (!is7 && !enabled) {
  clean_pane_persist()
  flash(`OUTDATED ${client.toUpperCase()} VERSION`, `BBT has been disabled\nNeed at least ${client} ${supported[client]}, found ${Zotero.version}, please upgrade.`, 30) // eslint-disable-line no-magic-numbers

  Components.utils.import('resource://gre/modules/AddonManager.jsm')
  AddonManager.getAddonByID('better-bibtex@iris-advies.com', addon => { addon.userDisabled = true })
}
