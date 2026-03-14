export const strcmp = (['base', 'accent', 'case', 'variant'] as const).reduce(
  (acc, sensitivity) => ({
    ...acc,
    [sensitivity]: new Intl.Collator(undefined, { sensitivity }).compare, // eslint-disable-line @typescript-eslint/unbound-method
  }),
  {} as Record<NonNullable<Intl.CollatorOptions['sensitivity']>, (a: string, b: string) => number>
)
