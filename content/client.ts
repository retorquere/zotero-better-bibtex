declare const Components: any
declare const ZOTERO_CONFIG: any

// we may be running in a translator, which will have it pre-loaded
if (typeof Components !== 'undefined') Components.utils.import('resource://zotero/config.js')

// for standalone tests'
export const client = ZOTERO_CONFIG.GUID.replace(/@.*/, '').replace('-', '')
