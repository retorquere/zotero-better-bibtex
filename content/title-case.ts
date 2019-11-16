import * as CSL from '../gen/citeproc'

// tslint:disable: no-var-keyword prefer-const semicolon prefer-template quotemark
function makeRegExp(lst) {
  var lst = lst.slice();
  var ret = new RegExp( "(?:(?:[?!:]*\\s+|-|^)(?:" + lst.join("|") + ")(?=[!?:]*\\s+|-|$))", "g");
  return ret;
}
// tslint:enable

const state = new class {
  public opt = { lang: 'en' }
  public locale: { [locale: string]: { opts: { 'skip-words'?: string[], 'skip-words-regexp'?: RegExp } } }

  constructor() {
    this.locale = {}
    this.locale[this.opt.lang] = { opts: {} }
    this.locale[this.opt.lang].opts['skip-words'] = CSL.SKIP_WORDS
    this.locale[this.opt.lang].opts["skip-words-regexp"] = makeRegExp(this.locale[this.opt.lang].opts["skip-words"]) // tslint:disable-line:quotemark semicolon
  }
}

export function titleCase(text) {
  const titleCased = CSL.Output.Formatters.title(state, text)
  return titleCased
}
