export function join(path, ...args) {
  if (!args.length) return path
  var platformSlash = Services.appinfo.OS == 'WINNT' ? '\\' : '/';
  return [path, ...args].join(platformSlash);
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
