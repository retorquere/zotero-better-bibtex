import format = require('string-template')
import { log } from './logger'
const dtdParser = require('./dtd-file.peggy')

let dtd: Record<string, string>

export function localize(id: string, params: any = null): string {
  try {
    dtd = dtd || dtdParser.parse(Zotero.File.getContentsFromURL('chrome://zotero-better-bibtex/locale/zotero-better-bibtex.dtd'))
    const str: string = dtd[id] || id
    return params ? (format(str, params) as string) : str
  }
  catch (err) {
    log.error('l10n.get', id, err)
    return id
  }
}
