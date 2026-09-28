import { parse, stringify } from 'lightning-yaml'

export function load(doc: string): any {
  // remove spurious document opening at the enc
  return parse(doc.replace(/\n---[\r\n]*$/, '\n...\n'))
}

export function dump(doc: unknown): string {
  // fixes https://github.com/retorquere/zotero-better-bibtex/issues/3615
  // ^(\s*)-      -> Capture leading indent ($1) and standalone hyphen
  // \r?\n        -> Newline immediately following the hyphen
  // \s+          -> Deeper indentation of the mapping key on the next line
  // ([\w-]+:)    -> Capture key name ($2)
  return stringify(doc).replace(/^(\s*)-\r?\n\s+([\w-]+:)/gm, '$1- $2')
}
