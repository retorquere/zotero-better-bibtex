import { log } from './logger'
import * as client from './client'
import { File } from './file'

// https://searchfox.org/mozilla-central/source/toolkit/modules/subprocess/subprocess_win.jsm#135 doesn't seem to work on Windows.
export async function findBinary(bin: string, installationDirectory: { mac?: string[]; win?: string[] } = {}): Promise<string> {
  const pref = `translators.better-bibtex.path.${ bin }`
  let location: string = Zotero.Prefs.get(pref) as string
  if (location && (await File.exists(location))) return location
  location = await pathSearch(bin, installationDirectory)
  if (typeof location === 'string') Zotero.Prefs.set(pref, location)
  return location
}

const ENV = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)
const VarRef = Zotero.isWin ? /%([A-Z][A-Z0-9]*)%/ig : /[$]([A-Z][A-Z0-9]*)|[$][{]([A-Z][A-Z0-9]*)[}]/ig

const resolver = new class {
  private cache: Map<string, string> = new Map

  resolve(path: string, seen: Record<string, boolean> = {}): string {
    let value: string

    if (!this.cache.has(path)) {
      this.cache.set(path, path.replace(VarRef, ($varName, ...args) => {
        if (!this.cache.has($varName)) {
          const varName: string = args.find(_ => _)

          if (seen[varName]) {
            log.error(`path-resolve: circular reference detected for environment variable ${varName}`)
            this.cache.set($varName, '')
          }
          else if (value = ENV.get(varName) || '') {
            this.cache.set($varName, this.resolve(value, { ...seen, [varName]: true }))
          }
          else {
            log.error(`path-search: environment variable ${varName} is not set`)
            this.cache.set($varName, '')
          }
        }

        return this.cache.get($varName)
      }))
    }

    return this.cache.get(path)
  }
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
  const paths: string[] = [ ...PATH.split(Zotero.isWin ? ';' : ':'), ...(installationDirectory[client.platform] || []) ]
    .map(p => resolver.resolve(p))
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
        const exe: string = PathUtils.join(path, bin + ext)
        if (!(await File.isFile(exe))) continue

        log.info(`path-search: ${ bin } found at ${ exe }`)
        return exe
      }
      catch (err) {
        log.info('path-search: cannot test', { path, bin, ext }, ':', err)
      }
    }
  }
  log.info(`path-search: ${ bin } not found in ${ PATH }`)
  return ''
}
