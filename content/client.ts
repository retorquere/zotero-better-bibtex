declare const Zotero: any
declare const location: any

export const worker = typeof location !== 'undefined' && location.search

const searchParams = worker && new URLSearchParams(location.search)

export const clientName = worker ? searchParams.get('clientName') : Zotero.clientName
export const slug = clientName.toLowerCase().replace('-', '')

export const ZoteroVersion = worker ? searchParams.get('ZoteroVersion') : Zotero.version
export const is7 = worker ? searchParams.get('is7') === 'true' : Zotero.platformMajorVersion >= 102
export const run = worker ? searchParams.get('run') : Zotero.Utilities.generateObjectKey()

export const locale = worker ? searchParams.get('locale') : Zotero.locale
export const platform = worker ? searchParams.get('platform') : Zotero.isWin ? 'win' : Zotero.isMac ? 'mac' : Zotero.isLinux ? 'lin' : 'unk'
export const isWin = worker ? searchParams.get('isWin') === 'true' : Zotero.isWin
export const isMac = worker ? searchParams.get('isMac') === 'true' : Zotero.isMac
export const isLinux = worker ? searchParams.get('isLinux') === 'true' : Zotero.isLinux
