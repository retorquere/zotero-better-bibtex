export type YAMLFormat = 'csl' | 'hayagriva' | 'unknown'

import csl from '../../gen/csl-schema.json' with { type: 'json' }

const cslFields = new Set(Object.values(csl.variables).flat())

export function detectFormat(data: unknown): YAMLFormat {
  if (!data || typeof data !== 'object') return 'unknown'

  if (Array.isArray(data)) {
    return data.every(item => Object.keys(item).every(key => cslFields.has(key))) ? 'csl' : 'unknown'
  }

  const values = Object.values(data)
  if (!values.length) return 'unknown'

  const hayagriva = values.every(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false
    // const record = value as Record<string, unknown>
    return typeof item.type === 'string' || typeof item.title === 'string'
  })

  return hayagriva ? 'hayagriva' : 'unknown'
}
