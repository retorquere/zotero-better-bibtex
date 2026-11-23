/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types */
export type YAMLFormat = 'csl' | 'hayagriva' | 'unknown'

function isCSL(item): boolean {
  return item.title || item.id
}
function isHayagriva(item): boolean {
  return item && typeof item === 'object' && (typeof item.type === 'string' || typeof item.title === 'string')
}
export function detectFormat(data: any): YAMLFormat {
  if (!data || typeof data !== 'object') return 'unknown'

  if (Array.isArray(data) && data.every(isCSL)) return 'csl'
  if (data.references && Array.isArray(data.references) && data.references.every(isCSL)) return 'csl'

  const values = Object.values(data)
  if (!values.length) return 'unknown'
  return values.every(isHayagriva) ? 'hayagriva' : 'unknown'
}
