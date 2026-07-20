export type YAMLFormat = 'csl' | 'hayagriva' | 'unknown'

export function detectFormat(data: unknown): YAMLFormat {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'unknown'

  const mapped = data as Record<string, unknown>
  if (Array.isArray(mapped.references)) return 'csl'

  const values = Object.values(mapped)
  if (!values.length) return 'unknown'

  const hayagriva = values.every(value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const record = value as Record<string, unknown>
    return typeof record.type === 'string' || typeof record.title === 'string'
  })

  return hayagriva ? 'hayagriva' : 'unknown'
}

export function parse(input: string, yamlLoad: (input: string) => any): any {
  input = input.replace(/\n---[\r\n]*$/, '\n...\n')
  return yamlLoad(input)
}
