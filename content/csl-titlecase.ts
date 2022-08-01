/* eslint-disable */

function makeRegExp(lst) {
  lst = lst.slice()
  const ret = new RegExp( "(?:(?:[?!:]*\\s+|-|^)(?:" + lst.join("|") + ")(?=[!?:]*\\s+|-|$))", "g")
  return ret
}

class State {
  public opt = { lang: 'en' }
  public locale: { [locale: string]: { opts: { 'skip-words'?: string[], 'skip-words-regexp'?: RegExp } } }
  public tmp: any

  constructor() {
    this.locale = {}
    this.locale[this.opt.lang] = { opts: {} }
    this.locale[this.opt.lang].opts['skip-words'] = Zotero.BetterBibTeX.CSL().SKIP_WORDS
    this.locale[this.opt.lang].opts["skip-words-regexp"] = makeRegExp(this.locale[this.opt.lang].opts["skip-words"]) // eslint-disable-line @typescript-eslint/quotes, @typescript-eslint/semi,@typescript-eslint/member-delimiter-style
    this.tmp = {}
  }
}

export function titleCased(text: string): string {
  return Zotero.BetterBibTeX.CSL().Output.Formatters.title(new State, text)
}
