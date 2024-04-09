export function join(path, ...args) {
  if (!args.length) return path

  if (typeof OS !== 'undefined') return OS.Path.join(...arguments)

  const platformSlash = Services.appinfo.OS == 'WINNT' ? '\\' : '/'
  try {
    if (args.length == 1 && args[0].includes(platformSlash)) return PathUtils.joinRelative(path, ...args)
    return PathUtils.join(path, ...args);
  }
  catch (e) {
    if (e.message.includes('NS_ERROR_FILE_UNRECOGNIZED_PATH')) {
      Cu.reportError("WARNING: " + e.message + " -- update for IOUtils")
      return [path, ...args].join(platformSlash);
    }
    throw e
  }
}

export function dirname(filename) {
  return typeof OS !== 'undefined' ? OS.Path.dirname(filename) : PathUtils.parent(path)
}

export function resolve(path) {
  throw 'not implemented'
}

export function extname(filename) {
  return filename.includes('.') ? ('.' + filename.split('.').pop()) : ''
}
