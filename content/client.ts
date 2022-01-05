// we may be running in a translator, which will have it pre-loaded
if (typeof Components !== 'undefined') Components.utils.import('resource://zotero/config.js')
declare const ZOTERO_CONFIG: any

export const client = ZOTERO_CONFIG.GUID.replace(/@.*/, '').replace('-', '')
