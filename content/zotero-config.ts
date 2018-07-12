declare const Components: any
declare const Zotero: any
declare const ZOTERO_CONFIG: any
declare const Services: any

import { debug } from './debug'

Components.utils.import('resource://zotero/config.js')
Components.utils.import('resource://gre/modules/Services.jsm')

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let ZoteroConfig = { ...ZOTERO_CONFIG } // tslint:disable-line:variable-name
ZoteroConfig.Zotero = {
  version: Zotero.version,
  platform: Zotero.platform,
  oscpu: Zotero.oscpu,
  locale: Zotero.locale,
  appName: Services.appinfo.name,
  appVersion: Services.appinfo.version,
  isZotero: ZoteroConfig.GUID === 'zotero@chnm.gmu.edu',
  isJurisM: ZoteroConfig.GUID === 'juris-m@juris-m.github.io',
}

debug('zotero config loaded:', ZoteroConfig)
