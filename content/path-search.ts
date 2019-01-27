declare const Components: any
declare const Zotero: any

Components.utils.import('resource://gre/modules/Subprocess.jsm')
declare const Subprocess: any

import * as log from './debug'

export async function pathSearch(bin) {
  const env = Subprocess.getEnvironment()
  if (Zotero.isWin) {
    // "PATH" on windows is case-insensitive, but https://searchfox.org/mozilla-central/source/toolkit/modules/subprocess/subprocess_win.jsm#135 looks specifically for PATH
    for (const [k, v] of Object.entries(env)) {
      const uk = k.toUpperCase()
      if (k !== uk && !env[uk]) env[uk] = v
    }
  }

  log.debug('pathSearch: looking for', bin, 'in', env.PATH)
  const path = await Subprocess.pathSearch(bin, env)
  log.debug('pathSearch:', bin, 'found at', path)
  return path
}
