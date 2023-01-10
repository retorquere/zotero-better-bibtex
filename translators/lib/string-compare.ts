const collator = new Intl.Collator('en')
export const stringCompare = collator.compare.bind(collator) as (left: string, right: string) => number
