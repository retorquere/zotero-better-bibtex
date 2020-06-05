declare const Components: any
declare const Zotero: any

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

const alias: { [key: string]: string } = {}
function getEnv(variable) {
  const ENV = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)
  const value = ENV.get(variable)
  if (value || !Zotero.isWin) return value

  if (typeof alias[variable] === 'undefined') {
    alias[variable] = ''
    for (const permutation of permutations(variable)) {
      if (ENV.get(permutation)) {
        alias[variable] = permutation
        break
      }
    }
  }

  if (!alias[variable]) return ''
  return ENV.get(alias[variable])
}

function expandWinVars(value) {
  let more = true
  while (more) {
    more = false
    value = value.replace(/%([A-Zaz]+)%/g, (match, variable) => {
      more = true
      return getEnv(variable)
    })
  }
  return value
}

// https://searchfox.org/mozilla-central/source/toolkit/modules/subprocess/subprocess_win.jsm#135 doesn't seem to work on Windows.
export async function pathSearch(bin, installationDirectory: { mac?: string, win?: string } = {}) {
  const env = {
    path: [],
    pathext: [],
    sep: '',
  }

  if (Zotero.isWin) {
    env.sep = '\\'

    env.path = []
    if (installationDirectory.win) env.path.push(installationDirectory.win)
    env.path = env.path.concat(getEnv('PATH').split(';').filter(p => p).map(expandWinVars))

    env.pathext = getEnv('PATHEXT').split(';').filter(pe => pe.length > 1 && pe.startsWith('.'))
    if (!env.pathext.length) {
      log.error('pathSearch: PATHEXT not set')
      return null
    }

  } else {
    const ENV = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)
    env.sep = '/'

    env.path = []
    if (Zotero.isMac && installationDirectory.mac) env.path.push(installationDirectory.mac)
    env.path = env.path.concat((ENV.get('PATH') || '').split(':').filter(p => p))

    env.pathext = ['']

  }

  if (!env.path.length) {
    log.error('pathSearch: PATH not set')
    return null
  }
  log.debug('pathSearch: looking for', bin, 'in', env)

  for (const path of env.path) {
    for (const pathext of env.pathext) {
      try {
        const cmd = OS.Path.join(path, bin + pathext)
        if (!(await OS.File.exists(cmd))) {
          log.debug(`pathSearch: ${bin} does not exist`)
          continue
        }
        const stat = await OS.File.stat(cmd)
        if (stat.isDir) {
          log.debug(`pathSearch: ${bin} is a directory`)
          continue
        }

        // tslint:disable-next-line:no-bitwise no-magic-numbers
        if (!Zotero.isWin && (stat.unixMode & 111) === 0) { // bit iffy -- we don't know if *we* can execute this.
          log.debug(`pathSearch: ${bin} exists but has mode ${(stat.unixMode).toString(8)}`)
          continue
        }

        log.debug(`pathSearch: ${bin} found at ${cmd}`)
        return cmd
      } catch (err) {
        log.error('pathSearch:', err)
      }
    }
  }
  log.debug('pathSearch: ', bin, 'not found in', env.path)

  return null
}
