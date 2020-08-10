import * as CSL from '../gen/citeproc'

// tslint:disable: no-var-keyword prefer-const semicolon prefer-template quotemark
function makeRegExp(lst) {
  var lst = lst.slice();
  var ret = new RegExp( "(?:(?:[?!:]*\\s+|-|^)(?:" + lst.join("|") + ")(?=[!?:]*\\s+|-|$))", "g");
  return ret;
}
// tslint:enable

class State {
  public opt = { lang: 'en' }
  public locale: { [locale: string]: { opts: { 'skip-words'?: string[], 'skip-words-regexp'?: RegExp } } }
  public tmp: any

  constructor() {
    this.locale = {}
    this.locale[this.opt.lang] = { opts: {} }
    this.locale[this.opt.lang].opts['skip-words'] = CSL.SKIP_WORDS
    this.locale[this.opt.lang].opts["skip-words-regexp"] = makeRegExp(this.locale[this.opt.lang].opts["skip-words"]) // tslint:disable-line:quotemark semicolon
    this.tmp = {}
  }
}

export function titleCase(text) {
  return CSL.Output.Formatters.title(new State, text)
}

export function sentenceCase(text) {
  let sentencecased = text.replace(/((?:^|[;?:.!]|[-\[\]<>'*\\(),{}_“”‘’])?\s*)([^-\s;?:.!\[\]<>'*\\(),{}_“”‘’]+)/g, (match, leader, word) => {
    console.log('=', { match, leader, word })
    if (leader && !leader.match(/^[;?:.!]/) && word.match(/^[A-Z][^A-Z]*$/)) word = word.toLowerCase()
    return (leader || '') + word
  })

  text.replace(/<span class="nocase">.*?<\/span>/gi, (match, offset) => {
    sentencecased = sentencecased.substr(0, offset) + match + this.substr(offset + match.length)
  })

  return sentencecased
}
