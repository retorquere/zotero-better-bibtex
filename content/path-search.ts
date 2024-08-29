import { log } from './logger'
import { Shim } from './os'
import * as client from './client'
const $OS = client.is7 ? Shim : OS

// https://searchfox.org/mozilla-central/source/toolkit/modules/subprocess/subprocess_win.jsm#135 doesn't seem to work on Windows.
export async function findBinary(bin: string, installationDirectory: { mac?: string[]; win?: string[] } = {}): Promise<string> {
  const pref = `translators.better-bibtex.path.${ bin }`
  let location: string = Zotero.Prefs.get(pref)
  if (location && (await $OS.File.exists(location))) return location
  location = await pathSearch(bin, installationDirectory)
  if (typeof location === 'string') Zotero.Prefs.set(pref, location)
  return location
}

const ENV = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)
const VarRef = Zotero.isWin ? /%([A-Z][A-Z0-9]*)%/ig : /[$]([A-Z][A-Z0-9]*)/ig
function resolveVars(path: string, resolved: Record<string, string>): string {
  let more = true
  while (more) {
    more = false
    path = path.replace(VarRef, (match, varref) => {
      more = true
      if (typeof resolved[varref] !== 'string') resolved[varref] = ENV.get(varref) || ''
      return resolved[varref]
    })
  }
  return path
}

const dirService = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties)
const cwd = dirService.get('CurWorkD', Components.interfaces.nsIFile)?.path ?? ''

async function pathSearch(bin: string, installationDirectory: { mac?: string[]; win?: string[] } = {}): Promise<string> {
  const PATH = ENV.get('PATH')
  if (!PATH.length) {
    log.error('path-search: PATH not set')
    return ''
  }

  log.info(`path-search: looking for ${ bin } in ${ PATH }`)
  const sep = Zotero.isWin ? '\\' : '/'
  const resolved = {}
  const paths: string[] = [ ...PATH.split(Zotero.isWin ? ';' : ':'), installationDirectory[client.platform] || '' ]
    .map(p => resolveVars(p, resolved))
    .filter(_ => _)
    .filter((p: string, i: number, self: string[]) => self.indexOf(p) === i) // unique
    .map(p => cwd && p[0] === '.' && (p[1] || sep) === sep ? `${cwd}${p.substring(1)}` : p)
  if (!paths.length) {
    log.error('path-search:', PATH, 'yielded no directories')
    return ''
  }

  const extensions: string[] = Zotero.isWin ? ENV.get('PATHEXT').split(';').filter((e: string) => e.match(/^[.].+/)) : ['']
  if (Zotero.isWin && !extensions.length) {
    log.error('path-search: PATHEXT not set')
    return ''
  }

  for (const path of paths) {
    for (const ext of extensions) {
      try {
        const exe: string = $OS.Path.join(path, bin + ext)
        if (!(await $OS.File.exists(exe))) continue

        // eslint-disable-next-line @typescript-eslint/await-thenable
        const stat = await $OS.File.stat(exe)
        if (stat.isDir) continue

        // bit iffy -- we don't know if *we* can execute this. And on Zotero 7, unixMode does not exist
        if (!Zotero.isWin && typeof stat.unixMode === 'number' && (stat.unixMode & 111) === 0) { // eslint-disable-line no-bitwise
          log.error(`path-search: ${ exe } exists but has mode ${ (stat.unixMode).toString(8) }`)
          continue
        }

        log.info(`path-search: ${ bin } found at ${ exe }`)
        return exe
      }
      catch (err) {
        log.error('path-search:', err)
      }
    }
  }
  log.info(`path-search: ${ bin } not found in ${ PATH }`)
  return ''
}
