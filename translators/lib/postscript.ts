/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export type Allow = {
  cache: boolean
  write: boolean
}
import type { ITranslator as Translator } from '../lib/translator'
import type { Fields as ExtraFields } from '../../content/extra'

export type Postscript = (entry: any, item: any, translator: Translator, extra: ExtraFields) => Allow

export function postscript(kind: 'csl' | 'tex', main: string, guard?: string): Postscript  {
  let body = ` // eslint-disable-line no-comma-dangle
    // phase out reference
    const reference = entry
  `

  if (kind === 'tex') {
    body += `
      const entrytype = reference.referencetype = entry.entrytype
    `
  }

  body += `
    const result = (() => {
      ${main};
    })()
  `

  if (kind === 'tex') {
    body += `
      if (entry.entrytype !== entrytype) {
        // entrytype changed, keep as-is
      }
      else if (reference.referencetype !== entrytype) {
        // phase out reference
        entry.entrytype = reference.referencetype
      }
      delete entry.referencetype
    `
  }

  body += `
    switch (typeof result) {
      case 'undefined': return { cache: true, write: true }
      case 'boolean': return { cache: result, write: true }
      default: return { cache: true, write: true, ...result }
    }
  `

  if (guard) {
    body = `
      ${guard} = true;
      try {
        ${body}
      }
      finally {
        ${guard} = false;
      }
    `
  }

  return new Function('entry', 'item', 'Translator', 'Zotero', 'extra', body) as Postscript
}

export const noop: Postscript = function(_entry: any, _item: any, _translator: Translator, _extra: ExtraFields): Allow { // eslint-disable-line prefer-arrow/prefer-arrow-functions
  return { cache: true, write: true }
}
