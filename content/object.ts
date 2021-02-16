export function fromEntries(kv: [string, unknown][]): Record<string, unknown> {
  return kv.reduce((acc: Record<string, unknown>, [k, v]: [string, unknown]) => {
    acc[k] = v
    return acc
  }, {})
}
