export interface MarkupNode {
  nodeName: string
  childNodes?: IZoteroMarkupNode[]
  attr?: { [key: string]: string }
  class?: { [key: string]: boolean }
  value?: string

  mode?: '' | 'text' | 'math'
  smallcaps?: boolean
  nocase?: boolean
  relax?: boolean
  enquote?: boolean

  offset?: number
  titleCased?: number

  source?: string
}

