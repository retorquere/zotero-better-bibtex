import { log } from './logger'
import { isWin } from './client'

export const File = new class {
  public async exists (path: string): Promise<boolean> {
    try {
      return await IOUtils.exists(path)
    }
    catch (e) {
      if (e.message.includes('NS_ERROR_FILE_UNRECOGNIZED_PATH')) {
        log.error(`${e.message}\n\n${e.stack}\n\n`)
        return false
      }
    }
  }

  public async isFile(path: string): boolean {
    try {
      return (await IOUtils.stat(path)).type == 'file'
    }
    catch (err) {
      if (err.name !== 'NotFoundError') log.error(path, 'isFile', err)
      return false
    }
  }

  public async lastModified(path: string): Promise<number> {
    try {
      const stat = await IOUtils.stat(path)
      if (stat.type !== 'file') return 0
      return stat.lastModificationDate.getTime()
    }
    catch (err) {
      return 0
    }
  }

  public async isDir(path: string): boolean {
    try {
      return (await IOUtils.stat(path)).type == 'directory'
    }
    catch (err) {
      if (err.name !== 'NotFoundError') log.error(path, 'isDir', err)
      return false
    }
  }

  public async makeDir(path: string): Promise<void> {
    try {
      await IOUtils.makeDirectory(path, { ignoreExisting: true, createAncestors: true })
    }
    catch (err) {
      if (DOMException.isInstance(err) && err.name === 'NoModificationAllowedError') return
      throw err
    }
  }
}

export const Path = new class {
  public home: string = FileUtils.getDir('Home', []).path

  #basenameRE = isWin ? /(^|\\)([^\\]+)\\?$/ : /(^|[/])([^/]+)[/]?$/
  public basename(path: string): string {
    // PathUtils.filename does not accept relative paths
    const m = path.match(this.#basenameRE)
    return m ? m[2] : path
  }

  isAbsolute(path: string): boolean {
    return isWin ? path.match(/:[\]/) : path[0] == '/'
  }
}
