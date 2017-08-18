debug = require('./debug.coffee')

Components.utils.import("resource://gre/modules/Services.jsm")

zotero_config = {}
Components.utils.import('resource://zotero/config.js', zotero_config) # Why Zotero doesn't just set this globally? Dunno.
zotero_config = Object.assign({}, zotero_config.ZOTERO_CONFIG)

zotero_config.isZotero = zotero_config.GUID == 'zotero@chnm.gmu.edu'
zotero_config.isJurisM = zotero_config.GUID == 'juris-m@juris-m.github.io'

Object.assign(zotero_config, {
  Zotero: {
    version: Zotero.version,
    platform: Zotero.platform,
    oscpu: Zotero.oscpu,
    locale: Zotero.locale,
    appName: Services.appinfo.name,
    appVersion: Services.appinfo.version
  }
})

debug('zotero config loaded:', zotero_config)

module.exports = zotero_config
