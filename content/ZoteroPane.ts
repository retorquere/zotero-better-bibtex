import type { XUL } from '../typings/xul'

import { log } from './logger'
import { TeXstudio } from './tex-studio'
import { Translators } from './translators'
import { Monkey } from './monkey-patch'
import { clean_pane_persist } from './clean_pane_persist'
import { Preference } from './prefs'
import { AutoExport } from './auto-export'
import { flash } from './flash'
import { sentenceCase } from './text'
import * as CAYW from './cayw'
import * as Extra from './extra'
import * as DateParser from './dateparser'
import * as l10n from './l10n'
import { Elements } from './create-element'
import { busyWait } from './busy-wait'
import { toClipboard } from './text'

type XULWindow = Window & {
  openDialog?: (url: string, id: string, options?: string, io?: any) => void
  ZoteroPane?: any
}

export async function newZoteroPane(win: XULWindow): Promise<void> {
  const zp = win.ZoteroPane
  await busyWait(() => typeof zp.itemsView.waitForLoad === 'function')
  await zp.itemsView.waitForLoad()
  new ZoteroPane(win)
}

class ZoteroPane {
  private monkey = new Monkey(true)
  // private elements: Elements
  private ZoteroPane: any
  private window: XULWindow

  public unload(): void {
    this.monkey.disable()
    // this.elements.remove()
  }

  public pullExport(): void {
    if (!this.ZoteroPane.collectionsView || !this.ZoteroPane.collectionsView.selection || !this.ZoteroPane.collectionsView.selection.count) return

    const row = this.ZoteroPane.collectionsView.selectedTreeRow

    const root = `http://127.0.0.1:${ Zotero.Prefs.get('httpServer.port') }/better-bibtex/export`
    const params = {
      url: {
        long: '',
        short: '',
      },
    }

    if (row.isCollection()) {
      let collection = this.ZoteroPane.getSelectedCollection()
      params.url.short = `${ root }/collection?/${ collection.libraryID || 0 }/${ collection.key }`

      let path = `/${ encodeURIComponent(collection.name) }`
      while (collection.parent) {
        collection = Zotero.Collections.get(collection.parent)
        path = `/${ encodeURIComponent(collection.name) }${ path }`
      }
      params.url.long = `${ root }/collection?/${ collection.libraryID || 0 }${ path }`
    }

    if (row.isLibrary(true)) {
      const libId = this.ZoteroPane.getSelectedLibraryID()
      const short = libId ? `/${ libId }/library` : 'library'
      params.url.short = `${ root }/library?${ short }`
    }

    if (!params.url.short) return

    this.window.openDialog('chrome://zotero-better-bibtex/content/ServerURL.xhtml', '', 'chrome,dialog,centerscreen,modal', params)
  }

  public padNum(n: number, width: number): string {
    return `${ n || 0 }`.padStart(width, '0')
  }
}
