declare const Zotero: any
declare const Components: any

import * as log from './debug'

// import Citeproc = require('./citeproc')
const citeproc = { CSL: null }
// const citeproc = { CSL: Zotero.CiteProc.CSL }

Components.utils.import('resource://gre/modules/Services.jsm')
declare const Services: any
if (!citeproc.CSL) Services.scriptloader.loadSubScript('chrome://zotero-better-bibtex/content/citeproc.js', citeproc, 'UTF-8')

const state = {
  opt: { lang: 'en' },

  locale: {
    en: {
      opts: {
        'skip-words': Zotero.CiteProc.CSL.SKIP_WORDS,
        'skip-words-regexp': new RegExp(`(?:(?:[?!:]*\\s+|-|^)(?:${Zotero.CiteProc.CSL.SKIP_WORDS.slice().join('|')})(?=[!?:]*\\s+|-|$))`, 'g'),
      },
    },
  },
}

export function titleCase(text) {
  const titleCased = citeproc.CSL.Output.Formatters.title(state, text)
  log.debug('titlecase:', {text, titleCased})
  return titleCased
}
