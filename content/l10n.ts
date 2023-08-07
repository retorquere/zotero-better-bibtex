import format = require('string-template')
import { log } from './logger'

const src = 'chrome://zotero-better-bibtex/locale/zotero-better-bibtex.properties'
const stringBundle = Services.strings.createBundle(src)

export function localize(id: string, params: any = null): string {
  try {
    const str: string = stringBundle.GetStringFromName(id)
    return params ? (format(str, params) as string) : str
  }
  catch (err) {
    log.error('l10n.get error:', src, id, err)
    return id
  }
}
