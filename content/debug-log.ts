import { jwk as pubkey } from './public'
import { DebugLog } from 'zotero-plugin/debug-log'

export const AltDebug = {
  on(): void {
    DebugLog.register('Better BibTeX', ['translators.better-bibtex.'], pubkey)
  },
  off(): void {
    DebugLog.unregister('Better BibTeX')
  },
}
