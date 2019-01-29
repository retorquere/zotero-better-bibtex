declare const Components: any
declare const Zotero: any

Components.utils.import('resource://gre/modules/Subprocess.jsm')
declare const Subprocess: any

import * as log from './debug'

export async function pathSearch(bin) {
  log.debug('pathSearch: looking for', bin)

  const env = Subprocess.getEnvironment()

  // https://searchfox.org/mozilla-central/source/toolkit/modules/subprocess/subprocess_win.jsm#135 looks for these variables only in uppercase
  if (!env.PATH) {
    log.error('pathSearch: PATH not set')
    return null
  }
  if (Zotero.isWin && !env.PATHEXT) {
    log.error('pathSearch: PATHEXT not set')
    return null
  }

  try {
    const path = await Subprocess.pathSearch(bin, env)
    log.debug('pathSearch:', bin, 'found at', path)
    return path
  } catch (err) {
    log.debug('pathSearch:', bin, 'not found:', err)
    return null
  }
}
