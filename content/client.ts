declare const Zotero: any

const ctx: DedicatedWorkerGlobalScope = typeof self === 'undefined' ? undefined : (self as any)
export const worker = !!(ctx?.location?.search)

function clientname(): string {
  if (worker) return (new URLSearchParams(ctx.location.search)).get('clientName')
  if (Zotero.clientName) return Zotero.clientName as string
  if (Zotero.BetterBibTeX?.clientName) return Zotero.BetterBibTeX.clientName as string
  throw new Error('Unable to detect clientName')
}

export const clientName = clientname()
export const client = clientName.toLowerCase().replace('-', '')
