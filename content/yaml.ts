import { parse, stringify } from 'lightning-yaml'

export function load(doc: string): any {
  // remove spurious document opening at the enc
  return parse(doc.replace(/\n---[\r\n]*$/, '\n...\n'))
}

export function dump(doc: unknown): string {
  return stringify(doc)
}
