// export singleton: https://k94n.com/es6-modules-single-instance-pattern

// new-style IDs
// arXiv:0707.3168 [hep-th]
// arXiv:YYMM.NNNNv# [category]
const post2007 = /(?:^|\s|\/)(?:arXiv:\s*)?(\d{4}\.\d{4,5}(?:v\d+)?)(?:\s\[(.*?)\])?(?=$|\s)/i

// arXiv:arch-ive/YYMMNNNv# or arXiv:arch-ive/YYMMNNNv# [category]
const pre2007 = /(?:^|\s|\/)(?:arXiv:\s*)?([a-z-]+(?:\.[A-Z]{2})?\/\d{2}(?:0[1-9]|1[012])\d{3}(?:v\d+)?(?=$|\s))/i

export class arXiv {
  public id = ''
  public category = ''
  public source = ''

  public parse(id: string, source = ''): boolean {
    if (!id) return false

    let match

    if (match = post2007.exec(id)) {
      this.id = this.id || match[1]
      this.category = this.category || match[2] && match[2].trim()
      this.source = this.source ? `${ this.source }, ${ source }` : source
      return true
    }

    if (match = pre2007.exec(id)) {
      this.id = this.id || match[1]
      this.source = this.source ? `${ this.source }, ${ source }` : source
      return true
    }

    return false
  }
}

export function parse(id: string): arXiv {
  const arxiv = new arXiv
  arxiv.parse(id)
  return arxiv
}
