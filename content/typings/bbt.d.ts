export type ParsedDate = {
  type?: 'date' | 'open' | 'verbatim' | 'season' | 'interval' | 'list'
  year?: number
  month?: number
  day?: number
  orig?: ParsedDate
  verbatim?: string
  from?: ParsedDate
  to?: ParsedDate
  dates?: ParsedDate[]
  season?: number
  uncertain?: boolean
  approximate?: boolean
}
