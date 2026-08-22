import { Preference } from '../prefs'
import { Events } from '../events'

import type { Jieba, splitName, pinyin } from './chinese-optional'
import { log } from '../logger'

class Chinese {
  private loaded = false
  public jieba!: Jieba
  public pinyin!: typeof pinyin
  public splitName!: typeof splitName

  constructor() {
    // this should give jieba time to load the dicts
    this.load()
  }

  public get enabled(): Chinese | undefined {
    this.load()
    return this.loaded ? this : undefined
  }

  private load() {
    if (Preference.chinese && !this.loaded) {
      // sets .loaded as a side-effect
      Services.scriptloader.loadSubScriptWithOptions('chrome://zotero-better-bibtex/content/key-manager/chinese-optional.js', {
        target: this,
        charset: 'utf-8',
        // ignoreCache: true,
      })

      if (this.jieba.error) log.error('failed to load jieba.cut:', this.jieba.error)
    }
  }

  init() {
    Events.on('preference-changed', ({ data: pref }) => {
      if (pref === 'chinese') this.load()
    })
  }
}

export const chinese = new Chinese
