import format = require('string-template')
import { log } from './logger'
import { is7 } from './client'

declare const Localization: any

const stringBundle = is7 ?  null : Services.strings.createBundle('chrome://zotero-better-bibtex/locale/zotero-better-bibtex.properties')
const l10n = is7 ? new Localization(['better-bibtex.ftl'], true) : null

export function localize(id: string, params: any = null): string {
  try {
    if (is7) {
      return l10n.formatValueSync(id, params || {}) as string
    }
    else {
      const str: string = stringBundle.GetStringFromName(id)
      return params ? (format(str, params) as string) : str
    }
  }
  catch (err) {
    log.error('l10n.get error:', id, err)
    return id
  }
}
