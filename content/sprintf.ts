import format from '@stdlib/string-format'

export function sprintf(template: string, values: Record<string, string | number | undefined>): string {
  const args: (string | number)[] = []
  const formatString = template.replace(/%%|%\(([^)]+)\)/g, (placeholder, name: string | undefined) => {
    if (typeof name === 'undefined') return placeholder

    args.push(values[name] ?? '')
    return `%${args.length}$`
  })

  return format(formatString, ...args)
}
