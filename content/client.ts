declare const Components: any
declare const ZOTERO_CONFIG: any

// we may be running in a translator, which will have it pre-loaded
if (typeof Components !== 'undefined') Components.utils.import('resource://zotero/config.js')

// check for process.version for node testing
export const client = (process.version === '') ? ZOTERO_CONFIG.GUID.replace(/@.*/, '').replace('-', '') : 'zotero'

