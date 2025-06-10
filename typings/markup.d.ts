declare type IZoteroMarkupNode = any;

export interface MarkupNode {
  nodeName: string
  childNodes?: IZoteroMarkupNode[]
  attr?: { [key: string]: string }
  class?: { [key: string]: boolean }
  value?: string

  smallcaps?: boolean
  nocase?: boolean
  relax?: boolean
  enquote?: boolean
  tt?: boolean

  offset?: number
  titleCased?: number

  source?: string
}

