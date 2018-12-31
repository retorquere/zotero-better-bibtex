// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let arXiv = new class {
  // new-style IDs
  // arXiv:0707.3168 [hep-th]
  // arXiv:YYMM.NNNNv# [category]
  private post2007Id = /(?:^|\s|\/)((?:arXiv:)?\d{4}\.\d{4,5}(?:v\d+)?)(\s\[a-z][-\.a-z]+[a-z]\])?(?=$|\s)/gi

  // arXiv:arch-ive/YYMMNNNv# or arXiv:arch-ive/YYMMNNNv# [category]
  private pre2007Id = /(?:^|\s|\/)((?:arXiv:)?[a-z-]+(?:\.[A-Z]{2})?\/\d{2}(?:0[1-9]|1[012])\d{3}(?:v\d+)?(?=$|\s))/gi

  private prefix = /^arxiv:/i

  public parse(id): { id: string, category?: string } {
    if (!id) return { id: null }

    let match

    while (match = this.post2007Id.exec(id)) {
      return { id: match[1].replace(this.prefix, ''), category: match[2] && match[2].trim() }
    }
    while (match = this.pre2007Id.exec(id)) {
      return { id: match[1].replace(this.prefix, '') }
    }

    if (!id) return { id: null }
  }
}
