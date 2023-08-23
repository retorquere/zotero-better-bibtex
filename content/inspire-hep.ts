import { log } from './logger'
import { parse as arXiv } from './arXiv'
import * as Extra from './extra'

function urls(item): { type: string, id: string, url: string }[] {
  const parsed = Extra.get(item.getField('extra'), 'zotero')

  const candidates: { type: string, id: string, url: string }[] = []

  let m
  const doi = (item.getField('DOI') || parsed.extraFields.kv.DOI || '').replace(/^https?:\/\/doi.org\//i, '')
  if (m = doi.match(/\/arXiv[.](.+)/i)) {
    candidates.push({ type: 'arXiv ID', id: m[1], url: `https://inspirehep.net/api/arxiv/${m[1]}` })
  }
  else if (doi) {
    candidates.push({ type: 'DOI', id: doi, url: `https://inspirehep.net/api/doi/${doi}` })
  }

  const arxiv = ((['arxiv.org', 'arxiv'].includes((item.getField('libraryCatalog') || '').toLowerCase())) && arXiv(item.getField('publicationTitle')).id) || arXiv(parsed.extraFields.tex['tex.arxiv']?.value).id
  if (arxiv) candidates.push({ type: 'arXiv ID', id: arxiv, url: `https://inspirehep.net/api/arxiv/${arxiv}` })

  return candidates
}

function parse(type, id, response): string {
  if (response.status && (response.status < 200 || response.status > 299)) {
    log.error('Could not fetch inspireHEP key for', type, id, 'InspireHEP says:', response.message)
    return null
  }

  if (response.metadata.texkeys.length === 0) {
    return null
  }

  if (response.metadata.texkeys.length > 1) log.error('Multiple inspireHEP keys found for', type, id, response.metadata.texkeys)
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
      log.error('inspireHEP', url, err)
    }
  }
  return ''
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function fetchSync(item: any): string {
  for (const {type, id, url} of urls(item)) {
    try {
      log.debug('inspire-HEP', url)
      const citekey = parse(type, id, JSON.parse(Zotero.File.getContentsFromURL(url)))
      if (citekey) return citekey
    }
    catch (err) {
      log.error('inspireHEP', url, err)
    }
  }
  return ''
}
