import { jwk as pubkey } from './public'
import { DebugLog } from 'zotero-plugin/debug-log'
import { prefix as autoexports } from './auto-export'

const prefix = 'translators.better-bibtex.'

export const AltDebug = {
  on(): void {
    DebugLog.register('Better BibTeX', [prefix, `${prefix}${autoexports}`], pubkey)
  },
  off(): void {
    DebugLog.unregister('Better BibTeX')
  },
}
