declare const Zotero: any
declare const location: any

export const worker: boolean = typeof location !== 'undefined' && location.search

const searchParams = worker && new URLSearchParams(location.search)

export const clientName: string = (() => {
  if (worker) return searchParams.get('clientName')
  const name = Zotero.clientName || Zotero.BetterBibTeX?.clientName // foreground translator doesn't have Zotero.clientName
  if (!name) throw new Error('Unable to detect clientName')
  return name as string
})()
export const slug: string = clientName.toLowerCase().replace('-', '')

export const ZoteroVersion: string = worker ? searchParams.get('ZoteroVersion') : Zotero.version
export const is7: boolean = worker ? searchParams.get('is7') === 'true' : Zotero.platformMajorVersion >= 102
export const run: string = worker ? searchParams.get('run') : Zotero.Utilities.generateObjectKey()

export const locale: string = worker ? searchParams.get('locale') : Zotero.locale
export const platform: string = worker ? searchParams.get('platform') : Zotero.isWin ? 'win' : Zotero.isMac ? 'mac' : Zotero.isLinux ? 'lin' : 'unk'
export const isWin: boolean = worker ? searchParams.get('isWin') === 'true' : Zotero.isWin
export const isMac: boolean = worker ? searchParams.get('isMac') === 'true' : Zotero.isMac
export const isLinux: boolean = worker ? searchParams.get('isLinux') === 'true' : Zotero.isLinux
