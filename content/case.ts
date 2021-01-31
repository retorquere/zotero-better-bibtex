/* eslint-disable */
import * as CSL from '../gen/citeproc'

function makeRegExp(lst) {
  var lst = lst.slice();
  var ret = new RegExp( "(?:(?:[?!:]*\\s+|-|^)(?:" + lst.join("|") + ")(?=[!?:]*\\s+|-|$))", "g");
  return ret;
}

class State {
  public opt = { lang: 'en' }
  public locale: { [locale: string]: { opts: { 'skip-words'?: string[], 'skip-words-regexp'?: RegExp } } }
  public tmp: any

  constructor() {
    this.locale = {}
    this.locale[this.opt.lang] = { opts: {} }
    this.locale[this.opt.lang].opts['skip-words'] = CSL.SKIP_WORDS
    this.locale[this.opt.lang].opts["skip-words-regexp"] = makeRegExp(this.locale[this.opt.lang].opts["skip-words"]) // eslint-disable-line @typescript-eslint/quotes, @typescript-eslint/semi,@typescript-eslint/member-delimiter-style
    this.tmp = {}
  }
}

export function titleCase(text: string): string {
  return CSL.Output.Formatters.title(new State, text)
}

export function sentenceCase(text: string): string {
  let sentencecased = text.replace(/((?:^|[?!]|[-.:;\[\]<>'*\\(),{}_“”‘’])?\s*)([^-\s;?:.!\[\]<>'*\\(),{}_“”‘’]+)/g, (match, leader, word) => {
    if (leader && !leader.match(/^[?!]/) && word.match(/^[A-Z][^A-Z]*$/)) word = word.toLowerCase()
    return (leader || '') + word
  })

  // restore protected parts from original
  text.replace(/<span class="nocase">.*?<\/span>|<nc>.*?<\/nc>/gi, (match: string, offset: number) => {
    sentencecased = sentencecased.substr(0, offset) + match + sentencecased.substr(offset + match.length)
    return match
  })

  return sentencecased
}

