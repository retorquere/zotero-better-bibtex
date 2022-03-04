/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export type Allow = {
  cache: boolean
  write: boolean
}

export type Postscript = (entry: any, item: any) => Allow

export function body(script: string, guard?: string): string  {
  script = `
    // phase out reference
    const reference = entry
    reference.referencetype = entry.entrytype
    const result = (() => {
      ${script};
    })()
    if (reference.referencetype !== entry.entrytype) entry.entrytype = reference.referencetype
    delete entry.referencetype
    switch (typeof result) {
      case 'undefined': return { cache: true, write: true }
      case 'boolean': return { cache: result, write: true }
      default: return { cache: true, write: true, ...result }
    }
  `

  if (guard) {
    script = `
      ${guard} = true;
      try {
        ${script}
      }
      finally {
        ${guard} = false;
      }
    `
  }

  return script
}

export function noop(_entry: any, _item: any): Allow {
  return { cache: true, write: true }
}
