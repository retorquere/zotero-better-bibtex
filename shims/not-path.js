export function join() {
  throw 'not implemented'
}

export function dirname(filename) {
  throw 'not implemented'
}

export function resolve(path) {
  throw 'not implemented'
}

export function extname(filename) {
  return filename.includes('.') ? ('.' + filename.split('.').pop()) : ''
}
