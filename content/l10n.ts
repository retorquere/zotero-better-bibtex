import format = require('string-template')
import { log } from './logger'
const dtdParser = require('./dtd-file.peggy')

const stringBundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://zotero-better-bibtex/locale/zotero-better-bibtex.properties')
const dtd = dtdParser.parse(Zotero.File.getContentsFromURL('chrome://zotero-better-bibtex/locale/zotero-better-bibtex.dtd'))

export function localize(id: string, params: any = null): string {
  try {
    const str: string = dtd[id] || stringBundle.GetStringFromName(id)
    return params ? (format(str, params) as string) : str
  }
  catch (err) {
    log.error('l10n.get', id, err)
    return id
  }
}
