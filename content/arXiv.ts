// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let arXiv = new class {
  // new-style IDs
  // arXiv:0707.3168 [hep-th]
  // arXiv:YYMM.NNNNv# [category]
  private new = /^arxiv:([0-9]{4}\.[0-9]+)(v[0-9]+)?([^\S\n]+\[(.*)\])?$/i

  // arXiv:arch-ive/YYMMNNNv# or arXiv:arch-ive/YYMMNNNv# [category]
  private old = /^arxiv:([a-z]+-[a-z]+\/[0-9]{7})(v[0-9]+)?([^\S\n]+\[(.*)\])?$/i

  // bare
  private bare = /^arxiv:[^\S\n]*([\S]+)/i

  private prefixed = /^arxiv:/i

  public parse(id, prefix_optional = false) {
    let m
    if (!id) return undefined

    const prefixed = this.prefixed.exec(id)
    if (!prefixed && prefix_optional) id = `arxiv:${id}`

    if (m = this.new.exec(id)) {
      return { id, eprint: m[1], eprintClass: m[4], style: 'new' } // tslint:disable-line:no-magic-numbers
    }
    if (m = this.old.exec(id)) {
      return { id, eprint: m[1], eprintClass: m[4], style: 'old' } // tslint:disable-line:no-magic-numbers
    }
    if (prefixed && (m = this.bare.exec(id))) {
      return { id, eprint: m[1] , style: 'bare' }
    }

    return undefined
  }
}
