declare const Components: any
declare const Zotero: any

Components.utils.import('resource://gre/modules/Subprocess.jsm')
declare const Subprocess: any

import * as log from './debug'

export async function pathSearch(bin) {
  let env
  if (Zotero.isWin) {
    env = {}
    // "PATH" on windows is case-insensitive, but https://searchfox.org/mozilla-central/source/toolkit/modules/subprocess/subprocess_win.jsm#135 looks specifically for PATH
    // and this object cannot be modified in place because it's a WrappedNative https://github.com/retorquere/zotero-better-bibtex/issues/972#issuecomment-458291368
    for (const [k, v] of Object.entries(Subprocess.getEnvironment())) {
      const uk = k.toUpperCase()
      if (k !== uk && !env[uk]) env[uk] = v
    }

  } else {
    env = Subprocess.getEnvironment()

  }

  log.debug('pathSearch: looking for', bin, 'in', env.PATH)
  const path = await Subprocess.pathSearch(bin, env)
  log.debug('pathSearch:', bin, 'found at', path)
  return path
}
