import { is7 } from './client'
import { log } from './logger'

export const PromptService = is7
  ? Services.prompt
  : Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)

export function alert({ title, text }: { title?: string; text: string }): void {
  PromptService.alert(null, title || 'Alert', text)
}

export function prompt({ title, text, value }: { title?: string; text: string; value?: string }): string {
  const wrap = { value: value || '' }
  if (PromptService.prompt(null, title || 'Enter text', text, wrap, null, {})) {
    return wrap.value
  }
  else {
    return ''
  }
}

export function modalDialogOpen(): boolean {
  if (!is7) return false

  const enumerator = Services.wm.getEnumerator('navigator:browser')
  while (enumerator.hasMoreElements()) {
    const win = enumerator.getNext()
    log.debug('3101:', win.document.title)
    if (typeof win.QueryInterface === 'function') {
      const baseWin = win.QueryInterface(Components.interfaces.nsIBaseWindow)
      if (baseWin?.modal) return true
    }
    else {
      log.debug('3101: modalDialogOpen:', typeof win.QueryInterface)
    }
  }
  return false
}

export async function modalsClosed(): Promise<void> {
  log.debug('3101: waiting for modal to close')
  while (modalDialogOpen()) {
    log.debug('3101: modal open')
    await Zotero.Promise.delay(300)
  }
  log.debug('3101: no modal open')
}
