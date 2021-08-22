export const worker = (typeof WorkerGlobalScope !== 'undefined') && (typeof importScripts === 'function') && (navigator instanceof WorkerNavigator)
export const zotero = (typeof Components !== 'undefined')
