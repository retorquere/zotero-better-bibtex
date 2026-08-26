export function alert({ title, text }: { title?: string; text: string }): void {
  // @ts-expect-error TS2345 https://github.com/windingwind/zotero-types/issues/97
  Services.prompt.alert(null, title || 'Alert', text)
}

export function prompt({ title, text, value }: { title?: string; text: string; value?: string }): string {
  const wrap = { value: value || '' }
  const ignore = { value: false }
  // @ts-expect-error TS2345 https://github.com/windingwind/zotero-types/issues/97
  if (Services.prompt.prompt(null, title || 'Enter text', text, wrap, null, ignore)) {
    return wrap.value
  }
  else {
    return ''
  }
}

export function confirm({ title, text }: { title?: string; text: string }): boolean {
  // @ts-expect-error TS2345 https://github.com/windingwind/zotero-types/issues/97
  return Services.prompt.confirm(null, title, text)
}
