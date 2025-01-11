export function alert({ title, text }: { title?: string; text: string }): void {
  Services.prompt.alert(null, title || 'Alert', text)
}

export function prompt({ title, text, value }: { title?: string; text: string; value?: string }): string {
  const wrap = { value: value || '' }
  if (Services.prompt.prompt(null, title || 'Enter text', text, wrap, null, {})) {
    return wrap.value
  }
  else {
    return ''
  }
}
