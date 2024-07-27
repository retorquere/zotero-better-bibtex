import { Translation, collect } from './lib/translator'
import type { Translators } from '../typings/translators.d.ts'
import type { ParseError } from '@retorquere/bibtex-parser'
import { detectImport as zotero_detectImport } from '../gen/ZoteroBibTeX.mjs'

declare const Zotero: any
declare var ZOTERO_TRANSLATOR_INFO: Translators.Header // eslint-disable-line no-var

export function doExport(): void {
  const translation = Translation.Export(ZOTERO_TRANSLATOR_INFO, collect())
  Zotero.BetterBibTeX.generateBibTeX(translation)
  translation.saveAttachments()
  Zotero.write(translation.output.body)
  translation.erase()
}

import * as escape from '../content/escape'

export function detectImport(): boolean {
  return Zotero.BetterBibTeX && Zotero.getHiddenPref('better-bibtex.import') && zotero_detectImport()
}

function importGroup(group, itemIDs, root = null) {
  const collection = new Zotero.Collection()
  collection.type = 'collection'
  collection.name = group.name
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  collection.children = group.entries.filter(citekey => itemIDs[citekey]).map(citekey => ({type: 'item', id: itemIDs[citekey]}))

  for (const subgroup of group.groups || []) {
    collection.children.push(importGroup(subgroup, itemIDs))
  }

  if (root) collection.complete()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return collection
}

export async function doImport(): Promise<void> {
  const translation = Translation.Import(ZOTERO_TRANSLATOR_INFO)

  let read
  let input = ''
  while ((read = Zotero.read(0x100000)) !== false) {
    input += read
  }

  if (translation.preferences.strings && translation.preferences.importBibTeXStrings) input = `${translation.preferences.strings}\n${input}`

  const start = Date.now()
  const bib = await Zotero.BetterBibTeX.parseBibTeX(input, translation)
  Zotero.debug(`parsed ${bib.entries.length} items in ${Date.now() - start}msec`)
  const errors: ParseError[] = bib.errors

  const whitelist = bib.comments
    .filter((comment: string) => comment.startsWith('zotero-better-bibtex:whitelist:'))
    .map((comment: string) => comment.toLowerCase().replace(/\s/g, '').split(':').pop().split(',').filter((key: string) => key))[0]

  const itemIDS = {}
  let imported = 0
  let id = 0
  for (const bibtex of bib.entries) {
    if (bibtex.key && whitelist && !whitelist.includes(bibtex.key.toLowerCase())) continue

    id++
    if ((id % 1000) === 0) await new Promise(resolve => setTimeout(resolve, 0))

    if (bibtex.key) itemIDS[bibtex.key] = id // Endnote has no citation keys

    try {
      const item = new Zotero.Item('journalArticle')
      item.itemID = id
      const builder = new translation.ZoteroItem(translation, item, bibtex, bib.jabref)
      if (builder.import(errors)) await item.complete()
    }
    catch (err) {
      Zotero.debug('bbt import error:', err)
      errors.push({ error: err.message, input: '' })
    }

    imported += 1
    Zotero.setProgress(imported / bib.entries.length * 100)
  }

  for (const group of bib.jabref.root || []) {
    importGroup(group, itemIDS, true)
  }

  if (errors.length) {
    const item = new Zotero.Item('note')
    item.note = 'Import errors found: <ul>'
    Zotero.debug(`import errors: ${JSON.stringify(errors)}`)
    for (const err of errors) {
      item.note += '<li>'
      item.note += escape.html(err.error)
      if (err.input) {
        Zotero.debug(`import error: ${err.error}\n>>>\n${err.input}\n<<<`)
        item.note += `<pre>${escape.html(err.input)}</pre>`
      }
      item.note += '</li>'
    }
    item.note += '</ul>'
    item.tags = [{ tag: '#Better BibTeX import error', type: 1 }]
    await item.complete()
  }

  Zotero.setProgress(100)
}
