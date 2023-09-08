import { log } from './logger'
import permutater = require('permutater')
// import { OS } from '../typings/xpcom'

function permutations(word) {
  const config = {
    charactersAt: {},
    length: word.length,
  }

  for (const [i, c] of word.split('').entries()) {
    config.charactersAt[i] = [ c.toUpperCase(), c.toLowerCase() ]
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return permutater(config)
}

const alias: { [key: string]: string } = {}
function getEnv(variable): string {
  const ENV = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)
  const value: string = ENV.get(variable)
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ENV.get(alias[variable])
}

function expandWinVars(value: string): string {
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
export async function findBinary(bin: string, installationDirectory: { mac?: string[], win?: string[] } = {}): Promise<string> {
  const pref = `extensions.zotero.translators.better-bibtex.path.${bin}`
  let location: string = Zotero.Prefs.get(pref)
  if (typeof location !== 'string') location = ''
  if (location === 'false') return ''
  if (location && (await OS.File.exists(location))) return location
  location = await pathSearch(bin, installationDirectory)
  Zotero.Prefs.set(pref, location)
  return location
}

async function pathSearch(bin: string, installationDirectory: { mac?: string[], win?: string[] } = {}): Promise<string> {
  const env: {path: string[], pathext: string[]} = {
    path: [],
    pathext: [],
  }

  if (Zotero.isWin) {
    env.path = []
    if (installationDirectory.win) env.path.push(...installationDirectory.win)
    env.path = env.path.concat(getEnv('PATH').split(';').filter(p => p).map(expandWinVars))

    env.pathext = getEnv('PATHEXT').split(';').filter(pe => pe.length > 1 && pe.startsWith('.'))
    if (!env.pathext.length) {
      log.error('pathSearch: PATHEXT not set')
      return null
    }

  }
  else {
    const ENV = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)
    env.path = []
    if (Zotero.isMac && installationDirectory.mac) env.path.push(...installationDirectory.mac)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
        const cmd: string = OS.Path.join(path, bin + pathext)
        if (!(await OS.File.exists(cmd))) continue

        // eslint-disable-next-line @typescript-eslint/await-thenable
        const stat = await OS.File.stat(cmd)
        if (stat.isDir) continue

        // eslint-disable-next-line no-bitwise
        if (!Zotero.isWin && (stat.unixMode & 111) === 0) { // bit iffy -- we don't know if *we* can execute this.
          log.error(`pathSearch: ${cmd} exists but has mode ${(stat.unixMode).toString(8)}`)
          continue
        }

        log.debug(`pathSearch: ${bin} found at ${cmd}`)
        return cmd
      }
      catch (err) {
        log.error('pathSearch:', err)
      }
    }
  }
  log.debug('pathSearch:', bin, 'not found in', env.path)

  return null
}
