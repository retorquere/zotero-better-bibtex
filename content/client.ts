declare const Zotero: any
declare const location: any

export const worker: boolean = typeof location !== 'undefined' && location.search
const searchParams = worker && new URLSearchParams(location.search)

export const name: string = (() => {
  if (worker) return searchParams.get('name')
  const $name: string = Zotero.clientName || Zotero.BetterBibTeX?.clientName // foreground translator doesn't have Zotero.clientName
  if (!$name) throw new Error('Unable to detect clientName')
  return $name
})()

export const version: string = (() => {
  if (worker) return searchParams.get('version')
  const $version: string = Zotero.version || Zotero.BetterBibTeX?.clientVersion // foreground translator doesn't have Zotero.clientName
  if (!$version) throw new Error('Unable to detect clientVersion')
  return $version
})()

export const slug: string = name.toLowerCase().replace('-', '')
export const is7: boolean = version[0] === '7'
export const isBeta: boolean = version.includes('beta')
export const run: string = worker ? searchParams.get('run') : Zotero.Utilities.generateObjectKey()

export const locale: string = worker ? searchParams.get('locale') : Zotero.locale
export const platform: string = worker ? searchParams.get('platform') : Zotero.isWin ? 'win' : Zotero.isMac ? 'mac' : Zotero.isLinux ? 'lin' : 'unk'
export const isWin: boolean = worker ? searchParams.get('isWin') === 'true' : Zotero.isWin
export const isMac: boolean = worker ? searchParams.get('isMac') === 'true' : Zotero.isMac
export const isLinux: boolean = worker ? searchParams.get('isLinux') === 'true' : Zotero.isLinux
