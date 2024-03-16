import { log } from './logger'
// import { OS } from '../typings/xpcom'

// https://searchfox.org/mozilla-central/source/toolkit/modules/subprocess/subprocess_win.jsm#135 doesn't seem to work on Windows.
export async function findBinary(bin: string, installationDirectory: { mac?: string[], win?: string[] } = {}): Promise<string> {
  const pref = `translators.better-bibtex.path.${bin}`
  let location: string = Zotero.Prefs.get(pref)
  if (location && (await OS.File.exists(location))) return location
  location = await pathSearch(bin, installationDirectory)
  if (typeof location === 'string') Zotero.Prefs.set(pref, location)
  return location
}

async function* asyncGenerator<T>(array: T[]): AsyncGenerator<T, void, unknown> {
  for (const item of array) {
    yield await Promise.resolve(item)
  }
}

const ENV = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)
const Var = Zotero.isWin ? /%([A-Z][A-Z0-9]*)%/ig : /[$]([A-Z][A-Z0-9]*)/ig
function expandVars(name: string, expanded: Record<string, string>): string {
  if (typeof expanded[name] !== 'string') {
    let more = true
    expanded[name] = ENV.get(name) || ''
    while (more) {
      more = false
      expanded[name] = expanded[name].replace(Var, (match, inner) => {
        more = true
        return expandVars(inner, expanded)
      })
    }
  }
  return expanded[name]
}

async function pathSearch(bin: string, installationDirectory: { mac?: string[], win?: string[] } = {}): Promise<string> {
  const env = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)

  let paths: string[] = ENV.get('PATH').split(Zotero.isWin ? ';' : ':')

  const expanded = {}
  paths = paths.map(p => expandVars(p, expanded))
  if (Zotero.isWin && installationDirectory.win) paths.unshift(...(installationDirectory.win))
  if (Zotero.isMac && installationDirectory.mac) paths.unshift(...(installationDirectory.mac))
  paths = paths.filter(p => p)
  if (!paths.length) {
    log.error('path-search: PATH not set')
    return ''
  }

  const extensions: string[] = Zotero.isWin ? ENV.get('PATHEXT').split(';').filter((e: string) => e.match(/^[.].+/)) : ['']
  if (Zotero.isWin && !extensions.length) {
    log.error('path-search: PATHEXT not set')
    return ''
  }

  for await (const path of asyncGenerator(paths)) {
    for (const ext of extensions) {
      try {
        const exe: string = OS.Path.join(path, bin + ext)
        if (!(await OS.File.exists(exe))) continue

        // eslint-disable-next-line @typescript-eslint/await-thenable
        const stat = await OS.File.stat(exe)
        if (stat.isDir) continue

        // eslint-disable-next-line no-bitwise
        if (!Zotero.isWin && (stat.unixMode & 111) === 0) { // bit iffy -- we don't know if *we* can execute this.
          log.error(`path-search: ${exe} exists but has mode ${(stat.unixMode).toString(8)}`)
          continue
        }

        log.debug(`path-search: ${bin} found at ${exe}`)
        return exe
      }
      catch (err) {
        log.error('path-search:', err)
      }
    }
  }
  log.debug('path-search:', bin, 'not found in', env.path)
  return ''
}
