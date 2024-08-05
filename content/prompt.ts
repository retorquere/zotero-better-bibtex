import { is7 } from './client'
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
