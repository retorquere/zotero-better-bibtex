debug = require('./debug.coffee')

zotero_config = {}
Components.utils.import('resource://zotero/config.js', zotero_config) # Why Zotero doesn't just set this globally? Dunno.
zotero_config = Object.assign({}, zotero_config.ZOTERO_CONFIG)

zotero_config.isZotero = zotero_config.GUID == 'zotero@chnm.gmu.edu'
zotero_config.isJurisM = zotero_config.GUID == 'juris-m@juris-m.github.io'

debug('zotero config loaded:', zotero_config)

module.exports = zotero_config
