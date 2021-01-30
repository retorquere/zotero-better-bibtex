interface IField {
  name: string
  verbatim?: string
  value: string | string[] | number | null | { path: string, title?: string, mimeType?: string } | { tag: string, type?: number }[]
  enc?: 'raw' | 'url' | 'verbatim' | 'creators' | 'literal' | 'latex' | 'tags' | 'attachments' | 'date'
  orig?: { name?: string, verbatim?: string, inherit?: boolean }
  bibtexStrings?: boolean
  bare?: boolean
  raw?: boolean

  // kept as seperate booleans for backwards compat
  replace?: boolean
  fallback?: boolean

  html?: boolean

  bibtex?: string
}