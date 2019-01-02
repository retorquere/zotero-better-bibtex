// declare const Zotero: any
declare const Components: any

import * as log from './debug'
import { patch as $patch$ } from './monkey-patch'

// import Citeproc = require('./citeproc')
const CiteProc = { CSL: null } // tslint:disable-line:variable-name
// const CiteProc = { CSL: Zotero.CiteProc.CSL } // tslint:disable-line:variable-name

Components.utils.import('resource://gre/modules/Services.jsm')
declare const Services: any
if (!CiteProc.CSL) Services.scriptloader.loadSubScript('chrome://zotero-better-bibtex/content/citeproc.js', CiteProc, 'UTF-8')

CiteProc.CSL.Doppeler = (function(cls) { // tslint:disable-line:only-arrow-functions
  function extend() {
    cls.apply(this, arguments)

    $patch$(this, 'split', original => function(str) {
      const res = original.apply(this, arguments)
      let fixed = false

      res.strings = res.strings.map(s => {
        if (typeof s === 'number') {
          if (!fixed) log.error('Zotero.Citeproc.CSL.Doppeler.split: expected string array, found number', { str, split: res })
          fixed = true
          return ''
        }
        return s
      })

      if (fixed && res.origStrings) res.origStrings = res.origStrings.map(s => typeof s === 'number' ? '' : s)

      return res
    })
  }

  extend.prototype = Object.create(cls.prototype)

  return extend

})(CiteProc.CSL.Doppeler)

const state = {
  opt: { lang: 'en' },

  locale: {
    en: {
      opts: {
        'skip-words': CiteProc.CSL.SKIP_WORDS,
        'skip-words-regexp': new RegExp( '(?:(?:[?!:]*\\s+|-|^)(?:' + CiteProc.CSL.SKIP_WORDS.join('|') + ')(?=[!?:]*\\s+|-|$))', 'g'), // tslint:disable-line:prefer-template
      },
    },
  },
}

export function titleCase(text) {
  const titleCased = CiteProc.CSL.Output.Formatters.title(state, text)
  log.debug('titlecase:', {text, titleCased})
  return titleCased
}
