declare const Components: any
declare const Zotero: any

import { KeyManager } from './key-manager.ts'
import { debug } from './debug.ts'

let pathsep, dirsep, ext

if (Zotero.platform.toLowerCase().startsWith('win')) {
  pathsep = ';'
  dirsep = '\\'
  ext = '.exe'
} else {
  pathsep = ':'
  dirsep = '/'
  ext = ''
}

const env = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)
const path = env.get('PATH')

debug('Trying to find TeXstudio:', {
  platform: Zotero.platform.toLowerCase(),
  pathsep,
  dirsep,
  path,
})

let texstudio = null
for (const dir of path.split(pathsep)) {
  if (!dir) continue

  debug('Trying to find TeXstudio:', `${dir}${dirsep}texstudio${ext}`)
  try {
    texstudio = Zotero.File.pathToFile(`${dir}${dirsep}texstudio${ext}`)
    if (texstudio.exists()) break
  } catch (err) {
    debug('Trying to find TeXstudio:', err)
  }
  texstudio = null
}
if (texstudio) {
  debug('TeXstudio: found at', texstudio.path)
} else {
  debug('TeXstudio: not found')
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let TeXstudio = { // tslint:disable-line:variable-name
  enabled: !!texstudio,

  async push() {
    if (!texstudio) throw new Error(`texstudio was not found in "${path}"`)

    const pane = Zotero.getActiveZoteroPane() // can Zotero 5 have more than one pane at all?

    let items
    try {
      items = pane.getSelectedItems()
      debug('TeXstudio:', items)
    } catch (err) { // zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
      debug('TeXstudio: Could not get selected items:', err)
      return
    }

    const citation = items.map(item => KeyManager.get(item.id).citekey).filter(citekey => citekey).join(',')
    if (!citation) {
      debug('TeXstudio: no items to cite')
      return
    }

    try {
      await Zotero.Utilities.Internal.exec(texstudio.path, ['--insert-cite', citation])
    } catch (err) {
      debug('TeXstudio: Could not get execute texstudio:', err)
    }
  },
}
