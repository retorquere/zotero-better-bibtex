import { log } from './logger'

declare const Localization: any

const strings = new Localization(['better-bibtex.ftl'])

const localized: Record<string, string> = {}

async function prefetch(id_with_branch: string): Promise<void> {
  try {
    if (id_with_branch.includes('.')) {
      const [ id, branch ] = id_with_branch.split('.')
      const messages = strings.formatMessages([{ id }])
      localized[id_with_branch] = messages[0]?.attributes[0][branch] as string || `!! ${id_with_branch}`
    }
    else {
      localized[id_with_branch] = await strings.formatValue(id_with_branch, {}) as string || `!! ${id_with_branch}`
    }
  }
  catch (err) {
    log.error('l10n.prefetch error:', id_with_branch, err)
    localized[id_with_branch] = `!! ${id_with_branch}`
  }
}

export function localize(id_with_branch: string, params?: Record<string, string | number>): string {
  const l = localized[id_with_branch] || `?? ${id_with_branch}`
  return params ? l.replace(/[{]\s*[$]([a-z]+)\s*[}]/gi, (m, term) => typeof params[term] === 'undefined' ? m : `${params[term]}`) : l
}

export async function initialize(): Promise<void> {
  const load = (require('../gen/l10n.json') as string[]).map(key => prefetch(key))
  await Promise.all(load)
}
