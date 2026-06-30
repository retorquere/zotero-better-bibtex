export const strcmp = (['base', 'accent', 'case', 'variant'] as const).reduce(
  (acc, sensitivity) => {
    // const collator = new Intl.Collator(undefined, { sensitivity, usage: 'sort', ignorePunctuation: true })
    const collator = new Intl.Collator(undefined, { sensitivity, usage: 'sort' })
    return {
      ...acc,
      [sensitivity]: collator.compare.bind(collator),
    }
  },
  {} as Record<NonNullable<Intl.CollatorOptions['sensitivity']>, (a: string, b: string) => number>
)

for (const sensitivity of ['base', 'accent', 'case'] as const) {
  const original = strcmp[sensitivity]
  strcmp[sensitivity] = (a: string, b: string): number => original(a, b) || strcmp.variant(a, b)
}
