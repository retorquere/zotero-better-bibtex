import { log } from './logger'
import { arXiv } from './arXiv'
import * as Extra from './extra'

function urls(item): { type: string, id: string, url: string }[] {
  const parsed = Extra.get(item.getField('extra'), 'zotero')

  const candidates: { type: string, id: string, url: string }[] = []

  const doi = (item.getField('DOI') || parsed.extraFields.kv.DOI || '').replace(/^https?:\/\/doi.org\//i, '')
  if (doi) candidates.push({ type: 'DOI', id: doi, url: `https://inspirehep.net/api/doi/${doi}` })

  const arxiv = ((['arxiv.org', 'arxiv'].includes((item.getField('libraryCatalog') || '').toLowerCase())) && arXiv.parse(item.getField('publicationTitle')).id) || arXiv.parse(parsed.extraFields.tex.arxiv).id
  if (arxiv) candidates.push({ type: 'arXiv ID', id: arxiv, url: `https://inspirehep.net/api/arxiv/${arxiv}` })

  return candidates
}

function parse(type, id, response): string {
  // eslint-disable-next-line no-magic-numbers
  if (response.status && (response.status < 200 || response.status > 299)) {
    log.debug('Could not fetch inspireHEP key for', type, id, 'InspireHEP says:', response.message)
    return null
  }

  if (response.metadata.texkeys.length === 0) {
    log.debug('No inspireHEP key found for', type, id)
    return null
  }

  if (response.metadata.texkeys.length > 1) log.debug('Multiple inspireHEP keys found for', type, id, response.metadata.texkeys)
  return (response.metadata.texkeys[0] as string)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function fetchAsync(item: any): Promise<string> {
  for (const {type, id, url} of urls(item)) {
    try {
      const citekey = parse(type, id, await (await fetch(url, { method: 'GET', cache: 'no-cache', redirect: 'follow' })).json())
      if (citekey) return citekey
    }
    catch (err) {
      log.debug('inspireHEP', url, err)
    }
  }
  return ''
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function fetchSync(item: any): string {
  for (const {type, id, url} of urls(item)) {
    try {
      const citekey = parse(type, id, JSON.parse(Zotero.File.getContentsFromURL(url)))
      if (citekey) return citekey
    }
    catch (err) {
      log.debug('inspireHEP', url, err)
    }
  }
  return ''
}
