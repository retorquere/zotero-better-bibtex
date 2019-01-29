declare const Components: any
declare const Zotero: any

Components.utils.import('resource://gre/modules/FileUtils.jsm')
declare const FileUtils: any

import * as log from './debug'
import permutater = require('permutater')

function permutations(word) {
  const config = {
    charactersAt: {},
    length: word.length,
  }

  for (const [i, c] of word.split('').entries()) {
    config.charactersAt[i] = [ c.toUpperCase(), c.toLowerCase() ]
  }
  return permutater(config)
}
const PATH = permutations('PATH')
const PATHEXT = permutations('PATHEXT')

// https://searchfox.org/mozilla-central/source/toolkit/modules/subprocess/subprocess_win.jsm#135 doesn't seem to work on Windows.
export async function pathSearch(bin) {
  const ENV = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)
  const env = {
    path: [],
    pathext: [],
    sep: '',
  }

  if (Zotero.isWin) {
    env.sep = '\\'

    for (const varname of PATH) {
      const path = ENV.get(varname)
      if (!path) continue
      env.path = path.split(';').filter(p => p)
      break
    }
    for (const varname of PATHEXT) {
      const pathext = ENV.get(varname)
      if (!pathext) continue
      env.pathext = pathext.split(';').filter(pe => pe.length > 1 && pe.startsWith('.'))
      break
    }
    if (!env.pathext.length) {
      log.error('pathSearch: PATHEXT not set')
      return null
    }

  } else {
    env.sep = '/'
    env.path = (ENV.get('PATH') || '').split(':').filter(p => p)
    env.pathext = ['']

  }

  if (!env.path.length) {
    log.error('pathSearch: PATH not set')
    return null
  }
  log.debug('pathSearch: looking for', bin, 'in', env)

  for (const path of env.path) {
    for (const pathext of env.pathext) {
      const cmd = new FileUtils.File(`${path}${env.sep}${bin}${pathext}`)
      if (cmd.exists() && cmd.isFile() && cmd.isExecutable()) {
        log.debug(`pathSearch: ${bin}${pathext} found at ${cmd.path}`)
        return cmd.path
      }
    }
  }
  log.debug('pathSearch: ', bin, 'not found in', env.path)

  return null
}
