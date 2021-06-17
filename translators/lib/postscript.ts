export type Allow = {
  cache: boolean
  write: boolean
}

export type Postscript = (reference: any, item: any) => Allow

export function body(script: string, guard?: string): string  {
  script = `
    const result = (() => {
      ${script};
    })()
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

export function noop(_reference: any, _item: any): Allow {
  return { cache: true, write: true }
}
