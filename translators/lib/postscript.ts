export type Allow = {
  cache: boolean
  write: boolean
}
import type { Translation } from '../lib/translator'

import type { Fields as ExtraFields } from '../../content/extra'
import { log } from '../../content/logger'

export type Postscript = (target: any, source: any, translator: Translation, extra: ExtraFields) => Allow

export function postscript(kind: 'csl' | 'tex', main: string, guard?: string): Postscript {
  let body = `
    // aliases for backwards compat
    const item = source;
    const zotero = source;

    const reference = target;
    const entry = target;
    const ${ kind } = target;

    // referencetype is the legacy name of entrytype
    const entrytype = reference.referencetype = entry.entrytype

    const result = (() => { ${ main }; })();

    // entry type change through legacy field
    if (entry.entrytype === entrytype && reference.referencetype !== entrytype) entry.entrytype = reference.referencetype
    delete entry.referencetype

    switch (typeof result) {
      case 'undefined': return { cache: true, write: true }
      case 'boolean': return { cache: result, write: true }
      case 'object': return { cache: true, write: true, ...result }
      default:
        Zotero.debug('Unexpected postscript result ' + JSON.stringify(result));
        return { cache: false, write: true }
    }
  `

  if (guard) body = `${ guard } = true; try { ${ body } } finally { ${ guard } = false; }`

  log.info(`postscript=${ body }`)

  return new Function('target', 'source', 'Translator', 'Zotero', 'extra', body) as Postscript
}

export const noop: Postscript = function(_entry: any, _item: any, _translator: Translation, _extra: ExtraFields): Allow {
  return { cache: true, write: true }
}
