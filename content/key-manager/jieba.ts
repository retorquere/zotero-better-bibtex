import { Preference } from '../../gen/preferences'
import { log } from '../logger'
import { Events } from '../events'

import Jieba = require('ooooevan-jieba')
import Trie = require('ooooevan-jieba/trieTree')

export const jieba = new class {
  private jieba: any

  init() {
    log.debug('jieba enabled:', Preference.jieba)
    this.load()
    Events.on('preference-changed', pref => {
      if (pref === 'jieba') this.load()
    })
  }

  private load() {
    if (Preference.jieba && !this.jieba) {
      this.jieba = new Jieba()
      for (const [k, v] of Object.entries(JSON.parse(Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/jieba/probabilities.json')))) {
        this.jieba[k] = v
      }
      const dict = JSON.parse(Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/jieba/dict.json'))
      this.jieba.tireTree = new Trie()
      this.jieba.tireTree.insertArr(dict.dictlineArr)
      this.jieba.tireTree.insertArr(dict.userDictlineArr)
      this.jieba._loaded = true // eslint-disable-line no-underscore-dangle
    }
  }

  cut(input: string): string[] {
    if (Preference.jieba) {
      this.init()
    }
    else {
      throw new Error('jieba not loaded')
    }
    return (this.jieba.cut(input, { cutAll: false, dag: false, hmm: true, cutForSearch: false }) as string[])
  }
}
