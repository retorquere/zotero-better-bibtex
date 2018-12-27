import { Logger } from './logger'

export function debug(...msg) {
  Logger.log('better-bibtex', ...msg)
}

export function error(...msg) {
  Logger.error('better-bibtex', ...msg)
}
