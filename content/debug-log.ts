import { jwk as pubkey } from './public'
import { DebugLogSender } from 'zotero-plugin/debug-log'
import { prefix as autoexports } from './auto-export'

const prefix = 'translators.better-bibtex.'
const pluginID = 'better-bibtex@iris-advies.com'

export const AltDebug = new class {
  #sender = new DebugLogSender(pluginID, 'Fallback Better BibTeX debug log (if regular fails)', [prefix, `${prefix}${autoexports}`], pubkey)

  on(): void {
    this.#sender.enabled = true
  }

  off(): void {
    this.#sender.enabled = false
  }
}
