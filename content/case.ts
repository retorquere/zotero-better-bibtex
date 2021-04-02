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
  let haslowercase = false
  const restore: [number, number, string][] = []
  let sentencecased = text.replace(/((?:^|[?!]|[-.:;\[\]<>'*\\(),{}_“”‘’])?\s*)([^-\s;?:.!\[\]<>'*\\(),{}_“”‘’]+)/g, (match: string, leader:string, word:string, offset: number) => {
    if (word.match(/^[A-Z]$/)) {
      const leaderlen = leader?.length
      restore.push([offset + leaderlen, offset + leaderlen + word.length, word])
    }
    else if (word.match(/^[a-z]/)) {
      haslowercase = true
    }
    if (leader && !leader.match(/^[?!]/) && word.match(/^[A-Z][^A-Z]*$/)) word = word.toLowerCase()
    return (leader || '') + word
  })

  if (haslowercase) {
    for (const [start, end, word] of restore) {
      sentencecased = sentencecased.substr(0, start) + word + sentencecased.substr(end)
    }
  }

  // restore protected parts from original
  text.replace(/<span class="nocase">.*?<\/span>|<nc>.*?<\/nc>/gi, (match: string, offset: number) => {
    sentencecased = sentencecased.substr(0, offset) + match + sentencecased.substr(offset + match.length)
    return match
  })

  return sentencecased
}

