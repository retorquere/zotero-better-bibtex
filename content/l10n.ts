import format = require('string-template')
import { log } from './logger'
import { is7 } from './client'

declare const Localization: any

const strings = is7
  ? new Localization(['better-bibtex.ftl'], true)
  : Services.strings.createBundle('chrome://zotero-better-bibtex/locale/zotero-better-bibtex.properties')

export const localizev = is7
  ? (id_with_branch: string, params: any = null): string => {
      if (id_with_branch.includes('.')) {
        const [ id, branch ] = id_with_branch.split('.')
        const messages = strings.formatMessagesSync([{ id, args: params || {}}])
        return messages[0].attributes[0][branch] as string
      }
      else {
        return strings.formatValueSync(id_with_branch, params || {}) as string
      }
    }
  : (id: string, params: any = null): string => {
      const str: string = strings.GetStringFromName(id)
      return params ? (format(str, params) as string) : str
    }

export function localize(id: string, params: any = null): string {
  try {
    return localizev(id, params) || `@${ id }`
  }
  catch (err) {
    log.error('l10n.get error:', id, err)
    return `!${ id }`
  }
}
