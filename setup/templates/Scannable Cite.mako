/* eslint-disable @typescript-eslint/no-unsafe-return, prefer-template,@typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-shadow, prefer-arrow/prefer-arrow-functions */

declare const Zotero: any

function strToDate(str) {
  return Zotero.Date.strToDate(str)
}

function itemToExportFormat(item) {
  return Zotero.Utilities.Internal.itemToExportFormat(item, false, true)
}

function getHiddenPref(key: string) {
  return Zotero.Prefs.get('translators.' + key)
}

type ScannableCite = {
  label: string
  id: string
}

export function scannableCite(item: any): ScannableCite {
  const items = [ itemToExportFormat(item) ]
  let text = ''
  const Zotero = {
    Utilities: {
      strToDate(str) {
        return strToDate(str)
      },
    },

    nextItem() {
      return items.shift()
    },

    write(str) {
      text += str
    },

    getHiddenPref(key) {
      return getHiddenPref(key)
    },
  }

  /* eslint-disable */
  const header = ${src}
  header.lastUpdated = null // pacify typescript needing to use all variables
  /* eslint-enable */

  doExport()

  const [ , label, , , id ] = text.split('|')

  return {
    label: label.trim(),
    id: id.replace('}', '').trim(),
  }
}
