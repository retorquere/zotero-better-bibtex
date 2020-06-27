declare const Components: any
declare const Zotero: any
declare const AddonManager: any

import { flash } from './flash'
import { client } from './client'
import * as built_against_schema from '../gen/schema-version.json'

const schema: { expected: number, found?: number } = {
  expected: built_against_schema[client],
  found: null,
}
try {
  switch (client) {
    case 'zotero':
      schema.found = JSON.parse(Zotero.File.getContentsFromURL('resource://zotero/schema/global/schema.json')).version

      break
    case 'jurism':
      schema.found = JSON.parse(Zotero.File.getContentsFromURL('resource://zotero/schema/global/schema-jurism.json')).version
      break
    default:
      throw new Error(`Unexpected client ${client}`)
  }

} catch (err) {
  schema.found = null
  flash('ERROR CHECKING ZOTERO SCHEMA VERSION', 30) // tslint:disable-line:no-magic-numbers
}

export const enabled = typeof schema.expected === 'number' && typeof schema.found === 'number' && schema.found === schema.expected
Zotero.debug(`monkey-patch: ${Zotero.version}: BBT ${enabled ? 'en' : 'dis'}abled`)
if (!enabled) {
  flash(`OUTDATED ${client.toUpperCase()} VERSION`, `BBT has been disabled\n${client} schema ${schema.expected} expected, ${schema.found} found, please upgrade ${client}`, 30) // tslint:disable-line:no-magic-numbers

  Components.utils.import('resource://gre/modules/AddonManager.jsm')
  AddonManager.getAddonByID('better-bibtex@iris-advies.com', addon => {
    // Add-on cannot be uninstalled
    if (!(addon.permissions & AddonManager.PERM_CAN_UNINSTALL)) return // tslint:disable-line:no-bitwise

    addon.uninstall()
    // if (addon.pendingOperations & AddonManager.PENDING_UNINSTALL) {
    // Need to restart to finish the uninstall.
    // Might ask the user to do just that. Or not ask and just do.
    // Or just wait until the browser is restarted by the user.
    // }
  })
}

const marker = 'BetterBibTeXMonkeyPatched'

export function repatch(object, method, patcher) {
  if (!enabled) return
  object[method] = patcher(object[method])
  object[method][marker] = true
}

export function patch(object, method, patcher) {
  if (!enabled) return
  if (object[method][marker]) throw new Error(`${method} re-patched`)
  repatch(object, method, patcher)
}
