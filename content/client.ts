declare const Zotero: any
declare const location: any

function clientname(): string {
  if (typeof location !== 'undefined' && location.search) return (new URLSearchParams(location.search)).get('clientName')
  if (Zotero.clientName) return Zotero.clientName as string
  if (Zotero.BetterBibTeX?.clientName) return Zotero.BetterBibTeX.clientName as string
  throw new Error('Unable to detect clientName')
}

export const clientName = clientname()
export const client = clientName.toLowerCase().replace('-', '')
