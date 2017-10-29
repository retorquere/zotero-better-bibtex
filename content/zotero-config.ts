declare const Components: any
declare const Zotero: any
declare const ZOTERO_CONFIG: any
declare const Services: any

import debug = require('./debug.ts')

Components.utils.import('resource://zotero/config.js')
Components.utils.import('resource://gre/modules/Services.jsm')

const zoteroConfig = { ...ZOTERO_CONFIG }
zoteroConfig.isZotero = zoteroConfig.GUID === 'zotero@chnm.gmu.edu'
zoteroConfig.isJurisM = zoteroConfig.GUID === 'juris-m@juris-m.github.io'
zoteroConfig.Zotero = {
  version: Zotero.version,
  platform: Zotero.platform,
  oscpu: Zotero.oscpu,
  locale: Zotero.locale,
  appName: Services.appinfo.name,
  appVersion: Services.appinfo.version,
}

debug('zotero config loaded:', zoteroConfig)

export = zoteroConfig
