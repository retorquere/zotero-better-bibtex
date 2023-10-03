import format = require('string-template')
import { log } from './logger'
import { is7 } from './client'

declare const Localization: any

const strings = is7
  ? new Localization(['better-bibtex.ftl'], true)
  : Services.strings.createBundle('chrome://zotero-better-bibtex/locale/zotero-better-bibtex.properties')

export const localizev = is7
  ? (id: string, params: any = null): string => {
    const str: string = strings.GetStringFromName(id)
    return params ? (format(str, params) as string) : str
  }
  : (id: string, params: any = null): string => strings.formatValueSync(id, params || {}) as string

export function localize(id: string, params: any = null): string {
  try {
    return localizev(id, params)
  }
  catch (err) {
    log.error('l10n.get error:', id, err)
    return id
  }
}
