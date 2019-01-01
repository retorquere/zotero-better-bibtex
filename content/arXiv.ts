// export singleton: https://k94n.com/es6-modules-single-instance-pattern

export let arXiv = new class {
  // new-style IDs
  // arXiv:0707.3168 [hep-th]
  // arXiv:YYMM.NNNNv# [category]
  private post2007 = /(?:^|\s|\/)(?:arXiv:\s*)?(\d{4}\.\d{4,5}(?:v\d+)?)(?:\s\[(.*?)\])?(?=$|\s)/i

  // arXiv:arch-ive/YYMMNNNv# or arXiv:arch-ive/YYMMNNNv# [category]
  private pre2007 = /(?:^|\s|\/)(?:arXiv:\s*)?([a-z-]+(?:\.[A-Z]{2})?\/\d{2}(?:0[1-9]|1[012])\d{3}(?:v\d+)?(?=$|\s))/i

  public parse(id): { id: string, category?: string } {
    if (!id) return { id: null }

    let match

    if (match = this.post2007.exec(id)) {
      return { id: match[1], category: match[2] && match[2].trim() }
    }

    if (match = this.pre2007.exec(id)) {
      return { id: match[1] }
    }

    return { id: null }
  }
}
