import { fromPairs } from 'lodash'

export function fromEntries(kv: [string | number, unknown][]): Record<string | number, unknown> {
  return fromPairs(kv) as Record<string | number, unknown>
}
