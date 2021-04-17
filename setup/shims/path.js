export function join() {
  return OS.Path.join.apply(null, arguments)
}

export function dirname(filename) {
  return OS.Path.dirname(filename)
}

export function resolve(path) {
  throw 'not implemented'
}

export function extname(filename) {
  return filename.includes('.') ? ('.' + filename.split('.').pop()) : ''
}
