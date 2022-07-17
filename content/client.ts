declare const Zotero: any

import { print } from './dump'

const ctx: DedicatedWorkerGlobalScope = typeof self === 'undefined' ? undefined : (self as any)
export const worker = !!(ctx?.location?.search)

function clientname(): string {
  if (worker) return (new URLSearchParams(ctx.location.search)).get('clientName')
  if (Zotero.clientName) return Zotero.clientName as string
  if (Zotero.BetterBibTeX?.clientName) return Zotero.BetterBibTeX.clientName as string
  // do something to detect node maybe
  // if (Zotero.Jurism) return 'Juris-M'
  print(`better-bibtex client detection: worker: ${worker}, assuming Zotero`)
  return 'Zotero'
}
export const clientName = clientname()
export const client = clientName.toLowerCase().replace('-', '')
