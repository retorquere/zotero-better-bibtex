export function fromEntries(kv: [string | number, unknown][]): Record<string | number, unknown> {
  return kv.reduce((acc: Record<string | number, unknown>, [k, v]: [string | number, unknown]) => {
    acc[k] = v
    return acc
  }, {})
}
