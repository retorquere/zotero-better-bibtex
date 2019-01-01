declare const Zotero: any
declare const Components: any

import * as log from './debug'
import { patch as $patch$ } from './monkey-patch'

// import Citeproc = require('./citeproc')
const citeproc = { CSL: null }
// const citeproc = { CSL: Zotero.CiteProc.CSL }

Components.utils.import('resource://gre/modules/Services.jsm')
declare const Services: any
if (!citeproc.CSL) Services.scriptloader.loadSubScript('chrome://zotero-better-bibtex/content/citeproc.js', citeproc, 'UTF-8')

$patch$(citeproc.CSL.Doppeler, 'split', original => function split(str) {
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
