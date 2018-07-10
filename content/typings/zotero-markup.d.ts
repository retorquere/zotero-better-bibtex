interface IZoteroMarkupNode {
  nodeName: string
  childNodes?: IZoteroMarkupNode[]
  attr?: { [key: string]: string }
  class?: { [key: string]: boolean }
  value?: string
  smallcaps?: boolean
  nocase?: boolean
  relax?: boolean
  offset?: number
  source?: string
}

